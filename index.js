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

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(`mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/`, 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
    }).then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.log('Failed to connect to MongoDB', err);
    }
);

const store = new mongoDBSession({
    uri: process.env.MONGODB_URI,
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

// Example protected route
app.get('/protected', (req, res, next) => {
    const userIsAuthorized = false; // Replace with actual authorization logic
    if (!userIsAuthorized) {
        res.status(403).render('403');
    } else {
        res.send('Protected content');
    }
});

// Include routes from separate files
const userCRUDRouter = require('./scripts/routes/user_post');
app.use('/', userCRUDRouter);

const mainPageGETRouter = require('./scripts/routes/no_authentication');
app.use('/', mainPageGETRouter);

const noAuthPages = require('./scripts/routes/no_authentication');
app.use('/', noAuthPages);

// Global Middleware to redirect if not logged in
const redirectIfNotLoggedIn = require('./scripts/middlewares/redirect');
app.use(redirectIfNotLoggedIn);

const authPages = require('./scripts/routes/authentication');
app.use('/', authPages);


app.get("*", (req, res) => {
    res.status(404).render("error", {msg: "Page not found", code: 404});
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
