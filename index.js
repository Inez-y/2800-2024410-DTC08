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

const userCRUDRouter = require('./scripts/routes/user_CRUD_post');
app.use('/', userCRUDRouter);

const mainPageGETRouter = require('./scripts/routes/no_auth');
app.use('/', mainPageGETRouter);

const noAuthPages = require('./scripts/routes/no_auth');
app.use('/', noAuthPages);


// Global Middleware to redirect if not logged in
const redirectIfNotLoggedIn = require('./scripts/middlewares/redirect');
app.use(redirectIfNotLoggedIn);

const authPages = require('./scripts/routes/auth');
app.use('/', authPages);



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});