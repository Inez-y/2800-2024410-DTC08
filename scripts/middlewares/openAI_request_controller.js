// contains functions that determine how to render chatbot responses
const { User } = require('../models/user');
const {
    generateRecipe,
    generateRecipeFromKitchen,
    beautifyStringifiedIngredients
} = require('../middlewares/openAI_controller');

/**
 * Sets up message_history and isRecipe variables based on whether the user is logged in and rendering a recipe
 * @param {*} renderingRecipe whether the query to be sent now to OpenAI is a recipe or not
 * @returns message_history and isRecipe variables
 * @author Alice Huang
 */
const setUpVariables = (req, renderingRecipe) => {
    let message_history;
    let isRecipe;
    if (req.session.loggedin) {
        message_history = req.session.message_history;
        isRecipe = req.session.isRecipe;
        if (renderingRecipe) {
            isRecipe.push(0);
            isRecipe.push(1);
        } else {
            isRecipe.push(0);
            isRecipe.push(0);
        }
    } else {
        message_history = [{
            role: 'system',
            content: 'You are a helpful assistant. You generate recipes based on user queries.'
        }];
        isRecipe = [0, 0, 0];
    }
    return { message_history, isRecipe };
}

/**
 * Renders the home page with the generated recipe
 * @author Alice Huang
 */
const renderRecipe = async (req, res) => {
    let { message_history, isRecipe } = setUpVariables(req, true);

    await generateRecipe(req.body.query, message_history);
    res.render('home', {
        response: message_history,
        show: null,
        isRecipe: isRecipe
    });
}

/**
 * Renders the home page with the generated recipe based on ingredients the user has
 * @author Alice Huang 
 */
const renderRecipeFromOwnedIngredients = async (req, res) => {
    let { message_history, isRecipe } = setUpVariables(req, true);

    message_history.push({
        role: 'user',
        content: `${req.body.query}`
    });

    let user = await User.findOne({ username: req.session.username });
    let ingredients = user.ingredients;

    if (user.ingredients.length === 0) {
        message_history.push({
            role: 'system',
            content: 'You do not have any ingredients to cook with. Please add ingredients with your camera or ask for a recipe with specific ingredients you have in mind.'
        });
        isRecipe[isRecipe.length - 1] = 0;
    } else {
        await generateRecipeFromKitchen(ingredients, message_history);
    }

    res.render('home', {
        response: message_history,
        show: null,
        isRecipe: isRecipe
    })
};

/**
 * Renders the home page with the ingredients the user has in their kitchen
 * @author Alice Huang
 */
const renderOwnedIngredients = async (req, res) => {
    let { message_history, isRecipe } = setUpVariables(req, false);
    let user = await User.findOne({ username: req.session.username });
    let ingredients = user.ingredients;

    let stringifiedIngredients = '';
    ingredients.forEach((ingredient) => {
        stringifiedIngredients += `${ingredient.amount} ${ingredient.unit} ${ingredient.name}, `;
    });
    stringifiedIngredients = 'You have ' + stringifiedIngredients + ' in your kitchen.';

    stringifiedIngredients = await beautifyStringifiedIngredients(stringifiedIngredients);
    console.log(stringifiedIngredients)

    message_history.push({
        role: 'user',
        content: `${req.body.query}`
    }, {
        role: 'system',
        content: `You have ${stringifiedIngredients} in your kitchen`
    });

    res.render('home', {
        response: message_history,
        show: null,
        isRecipe: isRecipe
    });
}

/**
 * Renders the home page with a message that the user's query is invalid
 * @author Alice Huang
 */
const renderInvalidQuery = async (req, res) => {
    let { message_history, isRecipe } = setUpVariables(req, false);

    message_history.push({
        role: 'user',
        content: `${req.body.query}`
    }, {
        role: 'system',
        content: 'That is not a valid query. Please try again.'
    });

    res.render('home', {
        response: message_history,
        show: null,
        isRecipe: isRecipe
    });
}

module.exports = { renderRecipe, renderOwnedIngredients, renderInvalidQuery, renderRecipeFromOwnedIngredients }