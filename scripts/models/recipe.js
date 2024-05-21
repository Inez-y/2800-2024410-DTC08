/**
 * Describes a Recipe model for the application using mongoose schema.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    steps : String,
    ingredients : [
        {
            name : {
                type: String,
                required: true
            },
            amount : {
                type : Number,
                required: true
            },
            unit: String
        }
    ],
    recipeName : {
        type: String,
        required: true
    },
    tags: [String]
});

module.exports = mongoose.model('Recipe', recipeSchema);