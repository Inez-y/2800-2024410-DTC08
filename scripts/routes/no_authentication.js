/**
 * Contains GET routes for the pages of the site where the user will not be redirected if not logged in.
 */

const express = require('express');
const router = express.Router();
const { redirectIfLoggedIn } = require('../middlewares/redirect');

const { validateQuery } = require('../middlewares/openAI_controller');
const { renderRecipe, renderOwnedIngredients, renderInvalidQuery } = require('../middlewares/openAI_request_controller');

/**
 * Renders the landing page
 * @author Daylen Smith
 */
router.get('/', async (req, res) => {
    res.render('landing');
});
// router.get('/home', async (req, res) => {
//     if (req.session.loggedin && req.session.message_history.length > 1) {
//         res.render('home', {
//             response: req.session.message_history,
//             show: false,
//             isRecipe: req.session.isRecipe
//         });
//     } else {
//         res.render('home', {
//             response: null,
//             show: true,
//             isRecipe: [0, 0, 0]
//         });
//     }
// });

/**
 * Generates a recipe based on the user's query and renders the landing page with the response
 * @author Alice Huang
 */
// router.post('/home', async (req, res) => {
//     console.log(req.session.message_history)
//     let query = req.body.query;
//     let valid = await validateQuery(query);

//     if (valid === 'recipe') {
//         renderRecipe(req, res);
//     } else if (valid === 'kitchen') {
//         renderOwnedIngredients(req, res);
//     } else {
//         renderInvalidQuery(req, res);
//     }
// });

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