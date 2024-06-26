/**
 * Contains the POST routes for CRUDding users.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const { User, userValidationSchema, passwordValidationSchema, userNameValidationSchema, emailValidationSchema } = require('../models/user');
const expireTimeOneHour = 60 * 60 * 1000;

/**
 * Initializes a session with the username and a max age of 1 hour.
 * @param {*} username The username of the user that logged in
 */
function initSession(req, username) {
    req.session.loggedin = true;
    req.session.username = username;
    req.session.cookie.maxAge = expireTimeOneHour;
    req.session.message_history = [{
        role: 'system',
        content: `You are a helpful assistant. You generate detailed recipes based on user queries. `
    },
    { role: 'user', content: `Provide a concrete amount of ingredients instead of a range. For example, use "1 cup of flour" instead of "1-2 cups of flour". ` }];
    req.session.isRecipe = [0, 0];
}

/**
 * Route to create a new user with joi validation, redirtects to register page if username or email already exists.
 * @author Daylen Smith
 */
router.post('/signUp', async (req, res) => {

    let { username, email, password } = req.body;
    username = username.trim();
    email = email.trim();
    password = password.trim();

    const { error } = userValidationSchema.validate({ username, email, password, role: "user" });

    if (error) {
        return res.status(400).redirect(`/signUp?msg=${error.details[0].message}`);
    }

    let userExists = await User.findOne({ username });
    let emailExists = await User.findOne({ email });

    if (userExists || emailExists) {
        return res.redirect('/signUp?msg=Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role: 'user' });

    await user.save();

    initSession(req, username);
    res.redirect('/home');
});

/**
 * Route to log in a user with joi validation, redirects to login page if username does not exist or password is incorrect.
 * @author Daylen Smith
 */
router.post('/logIn', async (req, res) => {
    let { username, password } = req.body;
    username = username.trim();
    password = password.trim();

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

    initSession(req, username);
    res.redirect('/home');
});

/**
 * Route to update user role, redirects to admin page if username does not exist.
 * Only admin users can access this route.
 * @author Daylen Smith
 */
router.post('/updateUserRole', async (req, res) => {
    let { username, role } = req.body;
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
    let { oldPassword, newPassword } = req.body;
    oldPassword = oldPassword.trim();
    newPassword = newPassword.trim();

    const { error } = passwordValidationSchema.validate({ oldPassword, newPassword });
    if (error) {
        return res.redirect(`/profile?msg=${error.details[0].message}`);
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
    let { newEmail } = req.body;
    newEmail = newEmail.trim();

    const { error } = emailValidationSchema.validate({ email: newEmail });
    if (error) {
        return res.redirect(`/profile?msg=${error.details[0].message}`);
    }

    const user = await User.findOne({ username: req.session.username });

    const newEmailExists = await User.findOne({ email: newEmail });

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
    let { email } = req.body;
    email = email.trim();
    const error = emailValidationSchema.validate({ email }).error;
    if (error) {
        return res.redirect(`/forgot?msg=${error.details[0].message}`);
    }
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
    transporter.verify();

    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: 'Password Reset',
        html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <a href="http://${req.headers.host}/resetPassword/${token}">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <img src="https://two800-2024410-dtc08.onrender.com/logo.png" alt="logo" width="100">`
    };

    transporter.sendMail(mailOptions);

    res.redirect('/forgot?msg=Email sent');

});

/**
 * Route to reset the password, redirects to forgot password page if token is invalid or expired.
 * If token is valid, redirects to login page after resetting the password.
 */
router.post('/resetPassword/:token', async (req, res) => {
    const token = req.params.token;
    newPassword = req.body.password;
    newPassword = newPassword.trim();

    const { error } = passwordValidationSchema.validate({ password: newPassword });
    if (error) {
        return res.redirect(`/forgot?msg=${error.details[0].message}`);
    }
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
        return res.redirect('/forgot?msg=Invalid or expired token');
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    initSession(req, user.username);
    res.redirect('/home');
});



module.exports = router;