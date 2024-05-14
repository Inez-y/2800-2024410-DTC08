/**
 * Contains the routes for CRUDding users.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { userSchema, userValidationSchema } = require('../models/user');

/**
 * Route to create a new user with joi validation, redirtects to register page if username or email already exists.
 */
router.post('/createUser', async (req, res) => {
    const { username, email, password} = req.body;

    const { error } = userValidationSchema.validate({ username, email, password });

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let userExists = await userSchema.findOne({ username});
    let emailExists = await userSchema.findOne({ email });

    if (userExists || emailExists) {
        return res.redirect('/register?msg=Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userSchema({ username, email, password: hashedPassword, role: 'user'});
    await user.save();

    req.session.loggedin = true;
    req.session.username = username;
    req.session.cookie.maxAge = expireTimeOneHour;
    res.redirect('/members-only');
});

module.exports = router;