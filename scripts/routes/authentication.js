/**
 * Contains GET routes for the pages of the site where the user will be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const { Recipe, recipeSchema } = require('../models/recipe');
const multer = require('multer');
const { analyzeImage } = require('../middlewares/imageController');
const { renderRecipe, renderOwnedIngredients, renderInvalidQuery } = require('../middlewares/openAI_request_controller');
const mongoose = require('mongoose');

const {
    validateQuery,
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
 * Renders the home page after user submits a query and displays the query response
 * @author Alice Huang
 */
router.post('/home', async (req, res) => {
    console.log(req.session.message_history)
    let query = req.body.query;
    let valid = await validateQuery(query);

    if (valid === 'recipe') {
        renderRecipe(req, res);
    } else if (valid === 'kitchen') {
        renderOwnedIngredients(req, res);
    } else {
        renderInvalidQuery(req, res);
    }});

router.get('/myKitchen', async (req, res) => {
    let user = await User.findOne({ username: req.session.username });
    let recipeIDs = user.favorites;
    let recipes = await Recipe.find({ _id: { $in: recipeIDs } });
    console.log(recipes[0]._id)
    res.render('favorites', { recipes: recipes})
});

router.get('/recipe/:id', async (req, res) => {
    console.log(req.params.id)
    let recipe;
    try {
        recipe = await Recipe.findById({ _id: req.params.id });
    } catch (err) {
        console.log(err)
        return res.status(400).send(err);
    }
    console.log(recipe.recipeName)
    res.render('recipe', { recipe: recipe.recipeName });
});

/**
 * Renders the favorites page (for testing)
 * @author Alice Huang
 */
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

    await User.updateOne({ username: req.session.username }, { $push: { favorites: recipe._id } });
    
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