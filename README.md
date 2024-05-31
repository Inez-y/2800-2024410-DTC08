# ReciPT

## CapWise

* [Project Description](#project-description)
* [Technologies](#technologies)
* [Contents](#content)
* [Usage Guide](#usage-guide)\
* [Product Guide](#product-guide)
* [Acknowledgements](#acknowledgements)
* [How did you use AI?](#how-did-you-use-ai)
* [Contact](#contact)


## Project Description
Our team is developing ReciPT, a daily food and recipe managing app that helps reduce food waste by suggesting healthy reicpes using available ingredients in your refrigerator and pantry. 
	
## Technologies
### Front-end:
* HTML 5, CSS
* JavaScript
* Tailwind CSS
### Back-end:
* Express.js 
* MongoDB 
* OpenAI API
* Clarifai API
	
## Content
Content of the project folder:

## Usage Guide
- 1. What does the developer need to install (don’t leave anything out!) like:
    1. language(s)
    2. IDEs
    3. Database(s)
    4. Other software
2. Which 3rd party APIs and frameworks does the developer need to download?
3. Do they need any API keys?
API
4. In which order should they install things? Does installation location matter?
5. Include detailed configuration instructions.
6. Include a link to the testing plan you have completed so the new developer can see your testing history and maybe contribute to a minor bugfix!
7. ***In a separate plaintext file called passwords.txt that has NOT been added to your repo, provide us with any admin/user/server login IDs and passwords. Don’t add this to your repo, especially if your repo is public! Upload this plaintext file to the 05d Dropbox in D2L.***

## Product Guide
- 

## How did you use AI?
1. Did you use AI to help create your app? If so, how? Be specific. [ 2 marks]
   We used copilot when coding to speed up the coding process. When we start writing the name of a function, copilot tries to guess what kind of code is needed. Sometimes the code it generates is functional, which we will adopt, and other times its code is not useful in which case we will just write our own code. 
2. DId you use AI to create data sets or clean data sets? If so, how? Be specific. [ 2 marks]
   No we did not use AI to create data sets or clean data sets.
3. Does your app use AI? If so, how? Be specific. [ 2 marks]
   Yes, our app uses OpenAI API for recipe generation, query validation, and string parsing. We also use Clarifai for image recognition of food ingredients.
4. Did you encounter any limitations? What were they, and how did you overcome them? Be specific. [ 2 marks]
   The first obstacle we faced was choosing to use Google Vision API for image recognition initially. This API did not work too well for the purposes of our app, since it recognizes items other than food in the image when we only want it to look at food. In the end, we decided to explore other image recognition APIs, and we decided to go with Clarifai who has a food-specific image recognition API.

## Contact 
* Shuaun Sy - ssy7@my.bcit.ca
* Inez Yoon - iyoon4@my.bcit.ca
* Tony Lai - mlai74@my.bcit.ca
* Daylen Smith - dsmith502@my.bcit.ca
* Alice Huang - alice.in.realityland@gmail.com

## Acknowledgements 
* <a href="https://fonts.google.com/">Google Fonts</a>
* <a href="https://tailwindcss.com/">Tailwind</a>
* <a href="https://expressjs.com/">Express</a>
* <a href="https://www.mongodb.com/">MongoDB</a>
* <a href="https://openai.com/">OpenAI</a>
* <a href="https://www.clarifai.com/">Clarifai</a>