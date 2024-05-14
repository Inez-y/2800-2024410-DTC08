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
    role: {
        type: String,
        default: 'user',
        required: true
    }
});

const passwordValidation = Joi.string().required();

const userValidationSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: passwordValidation,
    role: Joi.string().valid('user', 'admin').default('user').required(),
});

module.exports = {
    userSchema,
    userValidationSchema,
    passwordValidationSchema: passwordValidation
};