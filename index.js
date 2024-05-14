const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const joi = require('joi');
require('dotenv').config();
const app = express();
const ejs = require('ejs');
app.set("view engine", 'ejs');
const port = process.env.PORT || 3000;

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER_NAME;
const mongodb_password = process.env.MONGODB_USER_PASS;
const mongodb_database = process.env.MONGODB_DATABASE;
const node_session_secret = process.env.NODE_SESSION_SECRET;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const expireTimeOneHour = 60 * 60 * 1000;

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
}));

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

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

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});