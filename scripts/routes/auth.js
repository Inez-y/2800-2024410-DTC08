/**
 * Contains GET routes for the pages of the site where the user will be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();

router.get('/profile', async (req, res) => {
    res.send("Profile Page")
});

module.exports = router;