// contains functions that determine how to render chatbot responses

const {
    generateRecipe,
    validateQuery,
    generateRecipeFromKitchen,
    parseIngredients,
    parseSteps,
    parseName
} = require('../middlewares/openAI_controller');

/**
 * Sets up message_history and isRecipe variables based on whether the user is logged in and rendering a recipe
 * @param {*} req 
 * @param {*} renderingRecipe 
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
 * Renders the landing page with the generated recipe
 * @param {*} req 
 * @param {*} res 
 * @author Alice Huang
 */
const renderRecipe = async (req, res) => {
    let {message_history, isRecipe} = setUpVariables(req, true);

    await generateRecipe(req.body.query, message_history);
    res.render('landing', {
        response: message_history,
        show: null,
        isRecipe: isRecipe
    });
}

/**
 * Renders the landing page with the ingredients the user has in their kitchen
 * @param {*} req 
 * @param {*} res 
 * @author Alice Huang
 */
const renderOwnedIngredients = async (req, res) => {
    let {message_history, isRecipe} = setUpVariables(req, false);

    message_history.push({
        role: 'user',
        content: `${req.body.query}`
    }, {
        role: 'system',
        content: 'You have ... in your kitchen'
    });

    res.render('landing', {
        response: message_history,
        show: null,
        isRecipe: isRecipe
    });
}

/**
 * Renders the landing page with a message that the user's query is invalid
 * @param {*} req 
 * @param {*} res 
 * @author Alice Huang
 */
const renderInvalidQuery = async (req, res) => {
    let {message_history, isRecipe} = setUpVariables(req, false);

    message_history.push({
        role: 'user',
        content: `${req.body.query}`
    }, {
        role: 'system',
        content: 'That is not a valid query. Please try again.'
    });

    res.render('landing', {
        response: message_history,
        show: null,
        isRecipe: isRecipe
    });
}

module.exports = { renderRecipe, renderOwnedIngredients, renderInvalidQuery }