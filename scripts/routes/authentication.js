/**
 * Contains GET routes for the pages of the site where the user will be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const { Recipe, recipeSchema } = require('../models/recipe');
const multer = require('multer');
const { analyzeImage } = require('../middlewares/imageController');

const {
    generateRecipe,
    validateQuery,
    generateRecipeFromKitchen,
    parseIngredients,
    parseSteps,
    parseName
} = require('../middlewares/openAI_controller');

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
    console.log(req.session.message_history)
    console.log(req.session.isRecipe)
    if (req.session.message_history.length > 1) {
        res.render('home', {
            response: req.session.message_history,
            query: null,
            show: null,
            isRecipe: req.session.isRecipe
        });
    } else {
        res.render('home', {
            response: null,
            query: null,
            show: true,
            isRecipe: req.session.isRecipe
        });
    }
});

router.post('/home', async (req, res) => {
    console.log(req.session.message_history)
    let query = req.body.query;
    let valid = await validateQuery(query);

    if (valid === 'recipe') {
        let response = await generateRecipe(query, req.session.message_history);
        req.session.isRecipe.push(0);
        req.session.isRecipe.push(1);
        res.render('home', {
            response: req.session.message_history,
            query: query,
            show: null,
            isRecipe: req.session.isRecipe
        });
    } else if (valid === 'kitchen') {
        req.session.message_history.push({
            role: 'user',
            content: `${query}`
        }, {
            role: 'system',
            content: 'You have ... in your kitchen'
        });
        req.session.isRecipe.push(0);
        req.session.isRecipe.push(0);
        res.render('home', {
            response: req.session.message_history,
            query: query,
            show: null,
            isRecipe: req.session.isRecipe
        });
    } else {
        req.session.message_history.push({
            role: 'user',
            content: `${query}`
        }, {
            role: 'system',
            content: 'That is not a valid query. Please try again.'
        });
        req.session.isRecipe.push(0);
        req.session.isRecipe.push(0);
        res.render('home', {
            response: req.session.message_history,
            query: query,
            show: null,
            isRecipe: req.session.isRecipe
        });
    }});

router.post('/bookmark', async (req, res) => {
    let ingredients = JSON.parse(await parseIngredients(req.body.recipe));
    let steps = await parseSteps(req.body.recipe);
    let name = await parseName(req.body.recipe);
    console.log(ingredients)
    try {
        var recipe = new Recipe({recipeName: name, ingredients: ingredients, steps: steps, tags: []})
        recipe.save();
    } catch (err) {
        return res.status(400).send(err.details[0].message);
    }
    
    
    console.log(recipe._id)
    // let recipe = new Recipe{
    //     recipeName: name,
    //     ingredients: JSON.parse(ingredients),
    //     steps: steps,
    //     tags: []
    // }

    await User.updateOne({ username: req.session.username }, { $push: { favorites: recipe._id } });
    const user = await User.findOne({ username: req.session.username })
    console.log(user.favorites)
    // console.log(recipe)
    // user.favorites.push(recipe);
    
    res.send(`${recipe}`);
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