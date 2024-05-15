/**
 * Contains GET routes for the pages of the site where the user will not be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.send("Landing Page")
});

router.get("/signUp", async (req, res) => {
    res.send("signUp Page")
});

router.get("/logOut", async (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;