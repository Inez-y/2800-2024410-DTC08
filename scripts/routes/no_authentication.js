/**
 * Contains GET routes for the pages of the site where the user will not be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();
const { redirectIfLoggedIn } = require('../middlewares/redirect');

const {
    generateRecipe,
    validateQuery,
    generateRecipeFromKitchen
} = require('../middlewares/openAI_controller');

/**
 * Renders the landing page
 * @author Daylen Smith
 */
router.get('/', async (req, res) => {
    res.render('landing', {
        response: null,
        query: null,
        show: true,
        isRecipe: [0, 0, 0]
    });
});

/**
 * Generates a recipe based on the user's query and renders the landing page with the response
 * @author Alice Huang
 */
router.post('/', async (req, res) => {
    console.log(req.session.message_history)
    let query = req.body.query;
    let valid = await validateQuery(query);
    let message_history = [{
        role: 'system',
        content: 'You are a helpful assistant. You generate recipes based on user queries.'
    }];

    if (valid === 'recipe') {
        let response;
        if (req.session.loggedin) {
            response = await generateRecipe(query, req.session.message_history);
            res.render('landing', {
                response: req.session.message_history,
                query: query,
                show: null,
                isRecipe: [0, 0, 0]
            });
        } else {
            response = await generateRecipe(query, message_history);
            res.render('landing', {
                response: message_history,
                query: query,
                show: null,
                isRecipe: [0, 0, 0]
            });
        };
    } else if (valid === 'kitchen') {
        message_history.push({
            role: 'user',
            content: `${query}`
        }, {
            role: 'system',
            content: 'You have ... in your kitchen'
        });
        res.render('landing', {
            response: message_history,
            query: query,
            show: null,
            isRecipe: [0, 0, 0]
        });
    } else {
        message_history.push({
            role: 'user',
            content: `${query}`
        }, {
            role: 'system',
            content: 'That is not a valid query. Please try again.'
        });
        res.render('landing', {
            response: message_history,
            query: query,
            show: null,
            isRecipe: [0, 0, 0]
        });
    }
});

/**
 * Renders the log in page
 * @author Daylen Smith
 */
router.get("/logIn", redirectIfLoggedIn, async (req, res) => {
    res.render("login", {
        msg: req.query.msg
    });
});

/**
 * Renders the sign up page
 * @author Daylen Smith
 */
router.get("/signUp", redirectIfLoggedIn, async (req, res) => {
    res.render("signup", {
        msg: req.query.msg
    });
});

/**
 * Logs out the user and redirects to the landing page
 * @author Daylen Smith
 */
router.get("/logOut", async (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

/**
 * Renders the forgot password page
 * @author Daylen Smith
 */
router.get("/forgot", async (req, res) => {
    res.render("forgot", {
        msg: req.query.msg
    });
});

/**
 * Renders the reset password page if the token is valid, otherwise redirects to the forgot password page with an error message in the query string
 */
router.get("/resetPassword/:token", async (req, res) => {
    const token = req.params.token;
    res.render("resetpassword", {
        token: token
    });
});

module.exports = router;