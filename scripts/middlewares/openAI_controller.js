// Contains functions to make API calls to OpenAI

require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY
});

/**
 * Beautifies a string of ingredients.
 * @param {*} ingredients a string of ingredients
 * @returns a beautified string of ingredients
 * @author Alice Huang
 */
const beautifyStringifiedIngredients = async (ingredients) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system", content: `You are a helpful assistant. You beautify a string of ingredients given to you. Do not include 'ingredients' header. 
                                  Do not include context.`},
      { role: "assistant", content: "Understood. I will now beautify the stringified ingredients." },
      {
        role: 'user',
        content: `${ingredients}`
      }
    ],
    // max_tokens: 100
  })
  return response.choices[0].message.content;
}

/**
 * Parses the ingredients needed in a recipe and returns the ingredients in a specific JSON format
 * @param {*} recipe string of the recipe
 * @returns JSON string of ingredients in the recipe
 * @author Alice Huang
 */
const parseIngredients = async (recipe) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system", content: `You are a helpful assistant. You extract the ingredients needed in a cooking recipe by returning the ingredients in a 
                                 specific JSON format. For each ingredient, you list the name (a string), amount (a number), and unit (a string). For numbers, do not include fractions. Do not include 'ingredients' header. Do not include context.`},
      { role: "user", content: `Here is a sample JSON response for you to refer to: [{"name": "tomato", "amount": 2, "unit": "whole"}, {"name": "flour", "quantity": 0.5, "unit": "cup"}, {"name": "salt", "quantity": 1, "unit": "g"}]` },
      { role: "assistant", content: "Understood. I will now determine the ingredients in the recipe." },
      {
        role: 'user',
        content: `${recipe}`
      }
    ],
    // max_tokens: 100
  })
  return response.choices[0].message.content;
}

/**
 * Parses the cooking steps in a recipe and returns it as a string
 * @param {*} recipe string of recipe
 * @returns string of steps
 * @author Alice Huang
 */
const parseSteps = async (recipe) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: `You are a helpful assistant. You extract and return only the cooking steps in a cooking recipe. Do not include context.` },
      { role: "assistant", content: "Understood. I will now determine the steps in the recipe." },
      {
        role: 'user',
        content: `${recipe}`
      }
    ],
    // max_tokens: 100
  })
  return response.choices[0].message.content;
};

/**
 * Parses the name of a recipe and returns it as a string
 * @param {*} recipe string of recipe
 * @returns name as a string
 * @author Alice Huang
 */
const parseName = async (recipe) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: `You are a helpful assistant. You extract and return only the name of a cooking recipe. Do not include context.` },
      { role: "assistant", content: "Understood. I will now determine the name of the recipe." },
      {
        role: 'user',
        content: `${recipe}`
      }
    ],
    // max_tokens: 100
  })
  return response.choices[0].message.content;
};

/**
 * Generates a recipe based on the user's query
 * @param {*} query user's query as a string
 * @param {*} message_history message history as an array of objects to provide context for OpenAI
 * @returns response from OpenAI as a string
 * @author Alice Huang
 */
const generateRecipe = async (query, message_history) => {
  message_history.push({
    role: 'user',
    content: `${query}`
  });
  const recipe = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: message_history,
    // max_tokens: 100
  })
  message_history.push(recipe.choices[0].message)
  return recipe.choices[0].message.content;
}

/**
 * Generates a recipe based on ingredients in the user's kitchen
 * @param {*} ingredients 
 * @param {*} message_history 
 * @returns response from OpenAI as a string
 * @author Alice Huang
 */
const generateRecipeFromKitchen = async (ingredients, message_history) => {
  let stringifiedIngredients = '';
  ingredients.forEach((ingredient) => {
      stringifiedIngredients += `${ingredient.amount} ${ingredient.unit} ${ingredient.name}, `;
  });

  let temporaryMessageHistory = message_history.slice();
  temporaryMessageHistory.push({
    role: 'user',
    content: `I have ${stringifiedIngredients} in my kitchen, what can I make with them? Give me one recipe. Do not give me recipes that require more ingredients than I have. You do not need to use all ingredients.`});

  const recipe = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: temporaryMessageHistory,
    // max_tokens: 100
  })
  message_history.push(recipe.choices[0].message)
  return recipe.choices[0].message;
}

/**
 * Determines query type: "recipe" for recipe generation, "kitchen" for ingredient lookup, or "invalid" for all other queries
 * @param {*} query 
 * @returns a string
 * @author Alice Huang
 */
const validateQuery = async (query) => {
  const result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant. You determine whether a query is valid or not and the type of query by responding with 'recipe', 'kitchen', 'kitchen recipe', or 'invalid'." },
      {
        role: "user", content: `Valid queries are ones which ask you to generate a cooking recipe. 
                                 For queries which ask for a cooking recipe based on what the user currently has, and if user asks "what can i make" exactly, return 'kitchen recipe'.
                                 For queries which ask for a cooking recipe based on 0 or more ingredients, return 'recipe'. 
                                 For queries which ask what the user currently has, return 'kitchen'.
                                 For queries which ask you to generate another recipe, return 'recipe'.
                                 All other queries are invalid, and you should return 'invalid'.`},
      { role: "assistant", content: "Understood. I will now determine whether queries I receive are valid or not." },
      {
        role: 'user',
        content: `${query}`
      }
    ],
    max_tokens: 100
  })
  console.log(result.choices[0].message);
  return result.choices[0].message.content;
}

module.exports = { generateRecipe, validateQuery, generateRecipeFromKitchen, parseIngredients, parseSteps, parseName, beautifyStringifiedIngredients }