/**
 * Contains the POST routes for CRUDding users.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, userValidationSchema, passwordValidationSchema } = require('../models/user');
const expireTimeOneHour = 60 * 60 * 1000;

/**
 * Route to create a new user with joi validation, redirtects to register page if username or email already exists.
 * @author Daylen Smith
 */
router.post('/signUp', async (req, res) => {
    const { username, email, password } = req.body;

    const { error } = userValidationSchema.validate({ username, email, password });

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let userExists = await userSchema.findOne({ username });
    let emailExists = await userSchema.findOne({ email });

    if (userExists || emailExists) {
        return res.redirect('/signUp?msg=Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userSchema({ username, email, password: hashedPassword, role: 'user' });
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
    const user = await User.findOne({ username });

    const { error } = userValidationSchema.validate({ username, email, password });

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

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
    console.log(username, role)
    const u = await User.findOne({ username });
    console.log(u)
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
        return res.redirect('/update-password?msg=Incorrect password');
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

    const user = await User.findOne({ username: req.session.username });

    const newEmailExists = await User.findOne({ email: newEmail });
    if (newEmailExists.username !== user.username) {
        return res.redirect('/update-email?msg=Email has been taken');
    }

    user.email = newEmail;
    await user.save();
});


/**
 * Route to send a password reset email, redirects to forgot password page if email does not exist.
 * @author Daylen Smith
 */
router.post('resetPasswordEmail', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.redirect('/forgot?msg=Email does not exist');
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
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
        http://${req.headers.host}/reset/${token}\n\n
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

module.exports = router;