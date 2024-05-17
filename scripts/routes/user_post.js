/**
 * Contains the POST routes for CRUDding users.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const { User, userValidationSchema, passwordValidationSchema, userNameValidationSchema, emailValidationSchema} = require('../models/user');
const expireTimeOneHour = 60 * 60 * 1000;

/**
 * Route to create a new user with joi validation, redirtects to register page if username or email already exists.
 * @author Daylen Smith
 */
router.post('/signUp', async (req, res) => {

    const { username, email, password } = req.body;

    const { error } = userValidationSchema.validate({ username, email, password, role: "user" });

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let userExists = await User.findOne({ username });
    let emailExists = await User.findOne({ email });

    if (userExists || emailExists) {
        return res.redirect('/signUp?msg=Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role: 'user' });
    
    await user.save();

    req.session.loggedin = true;
    req.session.username = username;
    req.session.cookie.maxAge = expireTimeOneHour;
    res.redirect('/home');
});

/**
 * Route to log in a user with joi validation, redirects to login page if username does not exist or password is incorrect.
 * @author Daylen Smith
 */
router.post('/logIn', async (req, res) => {
    const { username, password } = req.body;

    const { nameError } = userNameValidationSchema.validate(username);
    const { pwError } = passwordValidationSchema.validate(password);
    if (nameError || pwError) {
        return res.redirect(`/logIn?msg=${(nameError || pwError).details[0].message}`);
    }

    const user = await User.findOne({ username });
    if (!user) {
        return res.redirect('/logIn?msg=Username does not exist');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.redirect('/logIn?msg=Incorrect password');
    }
    req.session.loggedin = true;
    req.session.username = username;
    req.session.cookie.maxAge = expireTimeOneHour;
    res.redirect('/home');
});

/**
 * Route to update user role, redirects to admin page if username does not exist.
 * Only admin users can access this route.
 * @author Daylen Smith
 */
router.post('/updateUserRole', async (req, res) => {
    const { username, role } = req.body;
    const u = await User.findOne({ username });
    if (!u) {
        return res.redirect('/admin?msg=Username does not exist');
    }
    await User.updateOne({ username: username }, { $set: { role: role } });
    res.redirect('/admin');
});

/**
 * Route to update user password, redirects to update password page if old password is incorrect.
 * @author Daylen Smith
 */
router.post('/updateUserPassword', async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const { error } = passwordValidationSchema.validate({ oldPassword, newPassword });
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const user = await User.findOne({ username: req.session.username });

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
        return res.redirect('/profile?msg=Incorrect password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
});

/**
 * Route to update user email, redirects to update email page if new email already exists.
 * @author Daylen Smith
 */
router.post('/updateUserEmail', async (req, res) => {
    const { newEmail } = req.body;
    console.log("new Email:" + newEmail);

    const { error } = emailValidationSchema.validate({ email: newEmail });
    if (error) {
        return res.redirect(`/profile?msg=${error.details[0].message}`);
    }

    const user = await User.findOne({ username: req.session.username });

    const newEmailExists = await User.findOne({ email: newEmail });
    console.log("new email exists: " + newEmailExists);
   
    if (newEmailExists !== null && newEmailExists.username !== user.username) {
        return res.redirect('/profile?msg=Email has been taken');
    }

    user.email = newEmail;
    await user.save();
    return res.redirect('/profile?msg=Email updated');
});


/**
 * Route to send a password reset email.
 * 
 * Finds the user with the input email and generates a token + expiry.
 * Sends an email with the token to the email address.
 * Redirects to the forgot password page with a message if the email does not exist.
 * @author Daylen Smith
 */
router.post('/forgot', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.redirect('/forgot?msg=Email does not exist');
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + expireTimeOneHour;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_APP_PASSWORD
        }

    });

    // Verify connection configuration
    transporter.verify((error, success) => {
        if (error) {
            console.error('Error with email transporter configuration:', error);
        } else {
            console.log('Email transporter is ready to send emails');
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/resetPassword/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });

    res.redirect('/forgot?msg=Email sent');

});

/**
 * Route to reset the password, redirects to forgot password page if token is invalid or expired.
 * If token is valid, redirects to login page after resetting the password.
 */
router.post('/resetPassword/:token', async (req, res) => {
    const token = req.params.token;
    const newPassword  = req.body.password;

    console.log("token: " + token);
    console.log("new password: " + newPassword);

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    console.log("user: " + user);

    if (!user) {
        return res.redirect('/forgot?msg=Invalid or expired token');
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.session.loggedin = true;
    req.session.username = user.username;
    req.session.cookie.maxAge = expireTimeOneHour;
    res.redirect('/home');
});



module.exports = router;