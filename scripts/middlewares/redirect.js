/**
 * Middleware that will redirect the user
 */

/**
 * Redirect to login page if not logged in
 * @author Daylen Smith
 * @returns None
 */
const redirectIfNotLoggedIn = (req, res, next) => {
    if (req.session.loggedin) {
        return next();
    } else {
        res.redirect('/');
    }
}

/**
 * Redirect to 403 error page if not admin
 * @author Daylen Smith
 * @returns 
 */
const redirectIfNotAdmin = async (req, res, next) => {
    const user = await User.findOne({ username: req.session.username });
    if (user.role === 'admin') {
        return next();
    } else {
        res.status(403);
        res.render("error", {msg: "You do not have permission to access this page", code: 403, username: req.session.username});
    }
}

/**
 * Redirects the user tot he main page if they are logged in
 * 
 * Used to prevent logged in users from logging in again or creating an account without logging out first
 * @author Daylen Smith
 * @returns 
 */
const redirectIfLoggedIn = async (req, res, next) => {
    if (req.session.loggedin) {
        res.redirect('/');
    } else {
        return next();
    }
}

module.exports =  {redirectIfNotLoggedIn, redirectIfNotAdmin, redirectIfLoggedIn};