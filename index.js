const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const joi = require('joi');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER_NAME;
const mongodb_password = process.env.MONGODB_USER_PASS;
const mongodb_database = process.env.MONGODB_DATABASE;
const node_session_secret = process.env.NODE_SESSION_SECRET;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const mongodb_full_uri = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
    extended: true
}));

// Connect to MongoDB
mongoose.connect(mongodb_full_uri).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Failed to connect to MongoDB', err);
});

const store = new mongoDBSession({
    uri: mongodb_full_uri,
    collection: 'sessions',
    crypto: {
        secret: mongodb_session_secret
    }
});

app.use(
    session({
        secret: node_session_secret,
        resave: true,
        saveUninitialized: false,
        store: store,
    })
);

// Mock functions (replace with actual implementations)
const verifyToken = (token) => true;
const resetPassword = (token, newPassword) => true;
const sendRecoveryEmail = (email) => true;

// Middleware to check if user is logged in
const redirectIfNotLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
};

// Routes
app.get('/', (req, res) => {
    res.render('landing', {
        userIsLoggedIn: req.session.isLoggedIn
    });
});

app.get('/signup', (req, res) => {
    res.render('signup', {
        userIsLoggedIn: req.session.isLoggedIn
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        userIsLoggedIn: req.session.isLoggedIn
    });
});

app.get('/loggedin', redirectIfNotLoggedIn, (req, res) => {
    res.render('loggedin', {
        userIsLoggedIn: req.session.isLoggedIn
    });
});

app.get('/loggedout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/');
    });
});

app.get('/userinfo', redirectIfNotLoggedIn, (req, res) => {
    res.render('userinfo', {
        userIsLoggedIn: req.session.isLoggedIn
    });
});

app.get('/camera', redirectIfNotLoggedIn, (req, res) => {
    res.render('camera', {
        userIsLoggedIn: req.session.isLoggedIn
    });
});

app.get('/favorites', redirectIfNotLoggedIn, (req, res) => {
    res.render('favorites', {
        userIsLoggedIn: req.session.isLoggedIn
    });
});

app.get('/reset', (req, res) => {
    const token = req.query.token;
    if (verifyToken(token)) {
        res.render('reset', {
            token,
            userIsLoggedIn: req.session.isLoggedIn
        });
    } else {
        res.status(400).send('Invalid or expired token');
    }
});

app.post('/reset', (req, res) => {
    const {
        token,
        password,
        confirmPassword
    } = req.body;
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }
    if (resetPassword(token, password)) {
        res.send('Password has been reset successfully');
    } else {
        res.status(500).send('Error resetting password');
    }
});

app.get('/forgot', (req, res) => {
    res.render('forgot', {
        msg: undefined,
        userIsLoggedIn: req.session.isLoggedIn
    });
});

app.post('/forgot', (req, res) => {
    const {
        email
    } = req.body;
    if (sendRecoveryEmail(email)) {
        res.render('forgot', {
            msg: 'Recovery email sent!',
            userIsLoggedIn: req.session.isLoggedIn
        });
    } else {
        res.render('forgot', {
            msg: 'Email not found.',
            userIsLoggedIn: req.session.isLoggedIn
        });
    }
});

// Example protected route
app.get('/protected', (req, res, next) => {
    const userIsAuthorized = false; // Replace with actual authorization logic
    if (!userIsAuthorized) {
        res.status(403).render('403', {
            userIsLoggedIn: req.session.isLoggedIn
        });
    } else {
        res.send('Protected content');
    }
});

// Catch-all route for 404 errors
app.use((req, res, next) => {
    res.status(404).render('error', {
        msg: "Page not found",
        code: 404,
        userIsLoggedIn: req.session.isLoggedIn
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});