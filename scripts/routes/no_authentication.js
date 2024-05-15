/**
 * Contains GET routes for the pages of the site where the user will not be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();

/**
 * Renders the landing page
 * @author Daylen Smith
 */
router.get('/', async (req, res) => {
    res.render('landing');
});

/**
 * Renders the log in page
 * @author Daylen Smith
 */
router.get("/logIn", async (req, res) => {
    res.render("login");
});

/**
 * Renders the sign up page
 * @author Daylen Smith
 */
router.get("/signUp", async (req, res) => {
    res.render("signup");
});

/**
 * Logs out the user and redirects to the landing page
 * @author Daylen Smith
 */
router.get("/logOut", async (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

/**
 * Renders the forgot password page
 * @author Daylen Smith
 */
router.get("forgotPassword", async (req, res) => {
    res.render("forgot");
});

module.exports = router;