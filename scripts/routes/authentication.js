/**
 * Contains GET routes for the pages of the site where the user will be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();
const { User } = require('../models/user');

/**
 * Renders the profile page
 * @author Daylen Smith
 */
router.get('/profile', async (req, res) => {
    const user = await User.findOne({ username: req.session.username });;
    res.render("profile", { user, msg: req.query.msg});
});

/**
 * Renders the home page
 * @author Daylen Smith
 */
router.get('/home', async (req, res) => {
    const user = await User.findOne({ username: req.session.username });
    res.render("home", { user, msg: req.query.msg });
});

module.exports = router;