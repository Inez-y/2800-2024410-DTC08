/**
 * Contains GET routes for the pages of the site where the user will not be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();

const { generateRecipe, validateQuery, generateRecipeFromKitchen } = require('../middlewares/openAI_controller');

/**
 * Renders the landing page
 * @author Daylen Smith
 */
router.get('/', async (req, res) => {
    res.render('landing', {response: null, query: null, show: true});
});

/**
 * Generates a recipe based on the user's query and renders the landing page with the response
 * @author Alice Huang
 */
router.post('/', async (req, res) => {
    let query = req.body.query;
    let valid = await validateQuery(query);
    if (valid === 'recipe') {
        let response = await generateRecipe(query, [{role: 'system', content: 'You are a helpful assistant. You generate recipes based on user queries.'}]);
        res.render('landing', {response: response, query: query, show: null});
    } else if (valid === 'kitchen') {
        res.render('landing', {response: 'You have ... in your kitchen', query: query, show: null});
    } else {
        res.render('landing', {response: 'That is not a valid query. Please try again.', query: query, show: null});
    }
});

/**
 * Renders the log in page
 * @author Daylen Smith
 */
router.get("/logIn", async (req, res) => {
    res.render("login", {msg: req.query.msg});
});

/**
 * Renders the sign up page
 * @author Daylen Smith
 */
router.get("/signUp", async (req, res) => {
    res.render("signup", {msg: req.query.msg});
});

/**
 * Logs out the user and redirects to the landing page
 * @author Daylen Smith
 */
router.get("/logOut", async (req, res) => {
    req.session.destroy();
    res.redirect('/loggedOut');
});

/**
 * Renders the logged out page
 * @author Daylen Smith
 */
router.get('/loggedOut', async (req, res) => {
    res.render("loggedOut");
});

/**
 * Renders the forgot password page
 * @author Daylen Smith
 */
router.get("/forgot", async (req, res) => {
    res.render("forgot", {msg: req.query.msg});
});

/**
 * Renders the reset password page if the token is valid, otherwise redirects to the forgot password page with an error message in the query string
 */
router.get("/resetPassword/:token", async (req, res) => {
    const token = req.params.token;
    res.render("resetpassword", {token: token});
});

module.exports = router;