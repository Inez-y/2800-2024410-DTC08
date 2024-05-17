/**
 * Contains GET routes for the pages of the site where the user will be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const multer = require('multer');
const { analyzeImage } = require('../middlewares/imageController');

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

/**
 * Image upload middleware for multer
 * @author Shaun Sy
 */
const upload = multer({ dest: 'uploads/' });

/**
 * Renders the camera page
 * @author Shaun Sy
 */
router.get('/camera', async (req, res) => {
    const user = await User.findOne({ username: req.session.username });
    res.render('camera', { user, msg: req.query.msg });
});

/**
 * Route for analyzing an image and returning detected ingredients
 * @author Shaun Sy
 */
router.post('/analyze-image', upload.single('image'), analyzeImage);


module.exports = router;