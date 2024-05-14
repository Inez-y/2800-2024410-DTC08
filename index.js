const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user');
const app = express();
const ejs = require('ejs');
app.set("view engine", 'ejs');
const port = process.env.PORT || 3000;

