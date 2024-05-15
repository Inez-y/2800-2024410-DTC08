/**
 * Contains GET routes for the pages of the site where the user will not be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();

/**
 * Renders the landing page
 */
router.get('/', async (req, res) => {
    res.send("Landing Page")
});

/**
 * Renders the log in page
 */
router.get("/logIn", async (req, res) => {
    res.send("log in Page")
});

/**
 * Renders the sign up page
 */
router.get("/signUp", async (req, res) => {
    res.send("signUp Page")
});

/**
 * Logs out the user and redirects to the landing page
 */
router.get("/logOut", async (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

/**
 * Renders the forgot password page
 */
router.get("forgotPassword", async (req, res) => {
    res.send("forgotPassword Page")
});

module.exports = router;