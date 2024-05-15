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
    const { username, email, password} = req.body;

    const { error } = userValidationSchema.validate({ username, email, password });

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let userExists = await userSchema.findOne({ username});
    let emailExists = await userSchema.findOne({ email });

    if (userExists || emailExists) {
        return res.redirect('/signUp?msg=Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userSchema({ username, email, password: hashedPassword, role: 'user'});
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
    if (newEmailExists) {
        return res.redirect('/update-email?msg=Email has been taken');
    }

    user.email = newEmail;
    await user.save();
});

module.exports = router;