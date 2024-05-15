/**
 * Middleware that will redirect the user
 */

/**
 * Redirect to login page if not logged in
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 * @returns None
 */
const redirectIfNotLoggedIn = (req, res, next) => {
    if (req.session.loggedin) {
        return next();
    } else {
        res.redirect('/');
    }
}

module.exports =  redirectIfNotLoggedIn;