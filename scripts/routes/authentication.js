/**
 * Contains GET routes for the pages of the site where the user will be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const { Recipe } = require('../models/recipe');
const multer = require('multer');
const { analyzeImage } = require('../middlewares/imageController');
const { renderRecipe, renderOwnedIngredients, renderInvalidQuery, renderRecipeFromOwnedIngredients } = require('../middlewares/openAI_request_controller');

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
    res.render("profile", { user, msg: req.query.msg });
});

/**
 * Renders the home page after user logs in and displays the user's message history if any
 * @author Alice Huang
 */
router.get('/home', async (req, res) => {
    if (req.session.loggedin && req.session.message_history.length > 2) {
        res.render('home', {
            response: req.session.message_history,
            show: false,
            isRecipe: req.session.isRecipe
        });
    } else {
        res.render('home', {
            response: null,
            show: true,
            isRecipe: [0, 0, 0]
        });
    }
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
    } else if (valid === 'kitchen recipe') {
        renderRecipeFromOwnedIngredients(req, res);
    } else {
        renderInvalidQuery(req, res);
    }
});

router.get('/myIngredients', async (req, res) => {
    const user = await User.findOne({ username: req.session.username });
    res.render('myIngredients', { ingredients: user.ingredients });
});

/**
 * Renders the saved page
 */
router.get('/saved', async (req, res) => {
    res.render('saved');
});

/**
 * Renders the recipes page
 * @author Alice Huang
 */
router.get('/recipes', async (req, res) => {
    let user = await User.findOne({ username: req.session.username });
    let recipeIDs = user.favorites;
    let recipes = await Recipe.find({ _id: { $in: recipeIDs } });
    res.render('recipes', { recipes: recipes })
    // let user = await User.findOne({ username: req.session.username });
    // let recipe = await Recipe.findById({ _id: user.favorites[0] });
    // res.render('recipe', { recipe: recipe });
});

/**
 * Renders the recipe page with the recipe details
 * @author Alice Huang
 */
router.get('/recipe/:id', async (req, res) => {
    console.log(req.params.id)
    let recipe;
    try {
        recipe = await Recipe.findById({ _id: req.params.id });
    } catch (err) {
        console.log(err)
        return res.status(400).send(err);
    }
    res.render('recipe', { recipe: recipe });
    // res.render('aboutus');
});

/**
 * Removes a recipe from the user's favorites list and from the database
 * @author Alice Huang
 */
router.post('/removeRecipe', async (req, res) => {
    const recipe = await Recipe.deleteOne({ _id: req.body.id });
    res.redirect('/saved');
});

/**
 * Saves the recipe to the the database
 * @author Alice Huang
 */
router.post('/save', async (req, res) => {
    let ingredients = JSON.parse(await parseIngredients(req.body.recipe));

    //test
    // const user = await User.findOne({ username: req.session.username });
    // user.ingredients = ingredients;
    // user.save();
    // console.log(user.ingredients)


    let steps = await parseSteps(req.body.recipe);
    let name = await parseName(req.body.recipe);
    console.log(ingredients)
    try {
        var recipe = new Recipe({ recipeName: name, ingredients: ingredients, steps: steps, tags: [] })
        recipe.save();
    } catch (err) {
        return res.status(400).send(err.details[0].message);
    }
    console.log(recipe._id)

    await User.updateOne({ username: req.session.username }, { $push: { favorites: recipe._id } });

    res.redirect('/saved');
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
router.post('/save-ingredients', upload.none(), async (req, res) => {

    try {
        const { ingredientNames, ingredientAmounts, ingredientUnits } = req.body;

        console.log('Received ingredientNames:', ingredientNames);
        console.log('Received ingredientAmounts:', ingredientAmounts);
        console.log('Received ingredientUnits:', ingredientUnits);

        if (!ingredientNames || !ingredientAmounts || !ingredientUnits) {
            console.error('Invalid data:', req.body);
            return res.status(400).send('Invalid data');
        }

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

/**
 * Route for updating ingredients in the user's profile
 */
router.post('/update-ingredients', async (req, res) => {
    const { ingredients } = req.body;

    try {
        const user = await User.findOne({ username: req.session.username });
        if (!user) {
            console.error('User not found in session');
            return res.status(401).send('User not authenticated');
        }

        if (!Array.isArray(ingredients)) {
            console.error('Invalid data format');
            return res.status(400).send('Invalid data format');
        }

        ingredients.forEach(updatedIngredient => {
            const ingredientIndex = user.ingredients.findIndex(i => i._id.toString() === updatedIngredient.id);
            if (ingredientIndex > -1) {
                user.ingredients[ingredientIndex].name = updatedIngredient.name;
                user.ingredients[ingredientIndex].amount = updatedIngredient.amount;
                user.ingredients[ingredientIndex].unit = updatedIngredient.unit;
            }
        });

        await user.save();
        res.status(200).send('Ingredients updated successfully');
    } catch (error) {
        console.error('Error updating ingredients:', error);
        res.status(500).send('Failed to update ingredients');
    }
});

/**
 * Route for deleting an ingredient from the user's profile
 */
router.delete('/delete-ingredient/:id', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.username });
        if (!user) {
            console.error('User not found in session');
            return res.status(401).send('User not authenticated');
        }

        const ingredientIndex = user.ingredients.findIndex(i => i._id.toString() === req.params.id);
        if (ingredientIndex > -1) {
            user.ingredients.splice(ingredientIndex, 1);
            await user.save();
            res.status(200).send('Ingredient deleted successfully');
        } else {
            res.status(404).send('Ingredient not found');
        }
    } catch (error) {
        console.error('Error deleting ingredient:', error);
        res.status(500).send('Failed to delete ingredient');
    }
});

module.exports = router;