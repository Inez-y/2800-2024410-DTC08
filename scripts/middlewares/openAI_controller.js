require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY
});

const generateRecipe = async (query, message_history) => {
    message_history.push({
        role: 'user',
        content: `${query}`
      });
    const recipe = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: message_history,
    max_tokens: 100
  })
  console.log(recipe.choices[0].message);
  message_history.push(recipe.choices[0].message)
  return recipe.choices[0].message.content;
}

const generateRecipeFromKitchen = async (ingredients, message_history) => {
    let ingredientString = ingredients.map((ingredient) => {return `${ingredient.quantity} ${ingredient.name}`;}).join(', ');

    console.log(ingredientString)
    message_history.push({role: 'user', content: `I have ${ingredientString}, what can I make with them? Do not give me recipes that require more ingredients than I have.`});
    const recipe = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: message_history,
    // max_tokens: 100
  })
  console.log(recipe.choices[0].message);
  message_history.push(recipe.choices[0].message)
  return recipe.choices[0].message;
}

const validateQuery = async (query) => {
    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a helpful assistant. You determine whether a query is valid or not and the type of query by responding with 'recipe', 'kitchen', or 'invalid'."},
        {role: "user", content: `Valid queries are ones which ask you to generate a cooking recipe. 
                                 For queries which ask for a cooking recipe based on 0 or more ingredients, return 'recipe'. 
                                 For queries which ask what the user currently has, return 'kitchen'.
                                 All other queries are invalid, and you should return 'invalid'.`},
        {role: "assistant", content: "Understood. I will now determine whether queries I receive are valid or not."},
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

module.exports = { generateRecipe, validateQuery, generateRecipeFromKitchen }