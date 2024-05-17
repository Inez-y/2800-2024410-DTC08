/**
 * Describes a User model for the application using mongoose schema and joi validation.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const userSchema = new Schema({
    username: 
    {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true},
    password: 
    {
        type: String,
        required: true
    
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    role: {
        type: String,
        default: 'user',
        required: true
    }
});
const User = mongoose.model('User', userSchema);

const userNameValidation = Joi.string().alphanum().min(3).max(30).required();

const passwordValidation = Joi.string().required();

const emailValidation = Joi.string().email().required();

const userValidationSchema = Joi.object({
    username: userNameValidation,
    email: emailValidation,
    password: passwordValidation,
    role: Joi.string().valid('user', 'admin').default('user').required(),
});

module.exports = {
    User,
    userValidationSchema,
    passwordValidation,
    userNameValidation,
    emailValidation
};