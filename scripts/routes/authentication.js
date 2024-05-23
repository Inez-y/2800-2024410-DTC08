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
    res.render("profile", { user, msg: req.query.msg });
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
 * Route for analyzing an image
 * @author Shaun Sy
 */
router.post('/analyze-image', upload.single('image'), analyzeImage);

/**
 * Route for saving ingredients to the user's profile
 * @author Shaun Sy
 */
router.post('/save-ingredients', upload.none(), async (req, res) => { // Use upload.none() for parsing non-file data
    console.log('Received form data:', req.body); // Log request body for debugging

    try {
        const { ingredientNames, ingredientAmounts, ingredientUnits } = req.body;

        // Log received data for debugging
        console.log('Received ingredientNames:', ingredientNames);
        console.log('Received ingredientAmounts:', ingredientAmounts);
        console.log('Received ingredientUnits:', ingredientUnits);

        if (!ingredientNames || !ingredientAmounts || !ingredientUnits) {
            console.error('Invalid data:', req.body);
            return res.status(400).send('Invalid data');
        }

        // Convert to arrays if only single element is received
        const names = Array.isArray(ingredientNames) ? ingredientNames : [ingredientNames];
        const amounts = Array.isArray(ingredientAmounts) ? ingredientAmounts : [ingredientAmounts];
        const units = Array.isArray(ingredientUnits) ? ingredientUnits : [ingredientUnits];

        const ingredients = names.map((name, index) => ({
            name,
            amount: parseFloat(amounts[index]),
            unit: units[index] || null,
        }));

        const userName = await User.findOne({ username: req.session.username });
        if (!userName) {
            console.error('User not found in session');
            return res.status(401).send('User not authenticated');
        }

        // Ensure userName.ingredients is an array
        if (!Array.isArray(userName.ingredients)) {
            userName.ingredients = [];
        }

        userName.ingredients.push(...ingredients);
        await userName.save();
        res.status(200).send('Ingredients saved successfully');
    } catch (error) {
        console.error('Error saving ingredients:', error);
        res.status(500).send('Failed to save ingredients');
    }
});


module.exports = router;