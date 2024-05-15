/**
 * Contains GET routes for the pages of the site where the user will be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();
const { User, userValidationSchema, passwordValidationSchema } = require('../models/user');

router.get('/profile', async (req, res) => {
    const user = await User.findOne({ username: req.session.username });
    res.render("profile", user);
});

module.exports = router;