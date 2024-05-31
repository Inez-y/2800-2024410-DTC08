/**
 * Contains GET routes for the pages of the site where the user will not be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();
const { redirectIfLoggedIn } = require('../middlewares/redirect');

/**
 * Renders the landing page
 * @author Daylen Smith
 */
router.get('/', async (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/home');
    } else {
        res.render('landing');
    }
});

/**
 * Renders the about us page
 * @author Daylen Smith
 */
router.get('/aboutUs', async (req, res) => {
    res.render('aboutUs');
});

/**
 * Renders the log in page
 * @author Daylen Smith
 */
router.get("/logIn", redirectIfLoggedIn, async (req, res) => {
    res.render("login", {
        msg: req.query.msg
    });
});

/**
 * Renders the sign up page
 * @author Daylen Smith
 */
router.get("/signUp", redirectIfLoggedIn, async (req, res) => {
    res.render("signup", {
        msg: req.query.msg
    });
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
router.get("/forgot", async (req, res) => {
    res.render("forgot", {
        msg: req.query.msg
    });
});

/**
 * Renders the reset password page if the token is valid, otherwise redirects to the forgot password page with an error message in the query string
 */
router.get("/resetPassword/:token", async (req, res) => {
    const token = req.params.token;
    res.render("resetpassword", {
        token: token
    });
});

module.exports = router;