const fetch = require('node-fetch');
require('dotenv').config();

/**
 * List of ingredients to compare detected ingredients against
 * @author Shaun Sy
 */
const rawIngredients = [
  'apple', 'banana', 'carrot', 'potato', 'onion', 'garlic', 'tomato',
  'lettuce', 'broccoli', 'spinach', 'chicken', 'beef', 'pork', 'fish',
  'egg', 'milk', 'cheese', 'yogurt', 'flour', 'sugar', 'salt', 'pepper',
  'orange', 'grape', 'berry', 'cucumber', 'celery', 'parsley', 'cilantro',
  'basil', 'mint', 'thyme', 'rosemary', 'sage', 'dill', 'corn', 'peas',
  'bean', 'lentil', 'rice', 'quinoa', 'barley', 'oat', 'almond', 'walnut',
  'cashew', 'peanut', 'sesame', 'sunflower', 'pumpkin', 'butter', 'cream',
  'honey', 'maple syrup', 'vinegar', 'soy sauce', 'olive oil', 'coconut oil',
  'avocado', 'bell pepper', 'zucchini', 'eggplant', 'mushroom', 'sweet potato',
  'beet', 'radish', 'turnip', 'chard', 'kale', 'leek', 'scallion', 'chive', 'ham'
];

/**
 * Middleware that analyzes an image and returns a list of detected ingredients
 * @author Shaun Sy
 */
const analyzeImage = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).send('No image data provided.');
    }

    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": process.env.CLARIFAI_USER_ID,
        "app_id": process.env.CLARIFAI_APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "base64": image
            }
          }
        }
      ]
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + process.env.CLARIFAI_PAT
      },
      body: raw
    };

    const response = await fetch(`https://api.clarifai.com/v2/models/${process.env.MODEL_ID}/versions/${process.env.MODEL_VERSION_ID}/outputs`, requestOptions);
    const result = await response.json();

    const ingredients = result.outputs[0].data.concepts.map(concept => concept.name);
    const rawDetectedIngredients = ingredients.filter(ingredient => rawIngredients.includes(ingredient.toLowerCase()));

    res.json({ ingredients: rawDetectedIngredients });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing image');
  }
};

module.exports = { analyzeImage };
