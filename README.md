# ReciPT
![Alt text](./public/image.png)
## CapWise

- [ReciPT](#recipt)
  - [CapWise](#capwise)
  - [Project Description](#project-description)
  - [Technologies](#technologies)
    - [Front-end:](#front-end)
    - [Back-end:](#back-end)
  - [Content](#content)
  - [Usage Guide](#usage-guide)
  - [Product Guide](#product-guide)
  - [How did you use AI?](#how-did-you-use-ai)
  - [Contact](#contact)
  - [Acknowledgements](#acknowledgements)


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
- Directory<br>
   |--- public             // Directory for storing static files such as images and styling files<br>
   |     |--- styles       // Directory for storing CSS files for styling<br>
   |--- scripts            // Directory for backend files<br>
   |     |--- middlewares  // Directory for middleware functions<br>
   |     |--- models       // Directory for data models<br>
   |     |--- routes       // Directory for route handling<br>
   |--- views              // Directory for EJS files for rendering views<br>
   |     |--- templates    // Directory for basic templates to display chatlog, messages, etc.<br>
   |--- .gitignore         // File specifying which files and directories to ignore in Git version control<br>
   |--- README.md          // Markdown file providing project documentation and instructions<br>
   |--- index.js           // Main JavaScript file for initializing the application<br>
   |--- package-lock.json  // Auto-generated file specifying exact versions of installed npm packages<br>
   |--- package.json       // File containing project metadata and dependencies<br>
   |--- postcss.config.js  // Configuration file for PostCSS, a tool for transforming styles with JS plugins<br>
   |--- tailwind.config.js // Configuration file for Tailwind CSS, a utility-first CSS framework<br>
   |--- tailwind.css       // Compiled CSS file generated from Tailwind CSS utility classes<br>



## Usage Guide
1. **What does the developer need to install:***
    1. Javascript and Node.js
    2. VS Code
    3. MongoDB and Studio3T
2. Which 3rd party APIs and frameworks does the developer need to download?
    There are third party frameworks and APIs needed to run this project, and they can be installed by running ```npm i``` in the terminal.
3. Do they need any API keys?
    Yes, they need OpenAI and Clarifai API keys.
4. In which order should they install things? Does installation location matter?
    It does not matter which order you install the software in. Location does not matter too much as long as it is easily acccesiblee for the developer.
5. Include detailed configuration instructions.
    1. ```npm i``` before running the app to ensure all dependencies are installed.
    2. Create a .env file in the root directory with  the following variables:
        ```
        MONGODB_USER_NAME=your_mongo_user_name
        MONGODB_USER_PASS=your_mongo_user_password
        MONGODB_HOST=your_mongo_host
        MONGODB_FULL_URI=your_mongo_full_uri
            NODE_SESSION_SECRET=your_session_secret

        EMAIL_ADDRESS=your_company_email_address
        EMAIL_PASSWORD=your_company_email_password
        EMAIL_APP_PASSWORD=your_company_email_app_password

        OPEN_AI_KEY=your_open_ai_key

        CLARIFAI_PAT=your_clarifai_pat
        CLARIFAI_USER_ID=your_clarifai_user_id
        CLARIFAI_APP_ID=your_clarifai_app_id
        MODEL_ID=your_clarifai_model_id
        MODEL_VERSION_ID=your_clarifai_model_version_id
        ```
    3. Run the app using `node index.js`
6. Testing Documentation:
    https://docs.google.com/spreadsheets/d/1QxuVCUUX1mXPwhumjsy79m_5JxqletrsVF9fa2xAd5s/edit#gid=0

## Product Guide
- 

## How did you use AI?
1. **Did you use AI to help create your app? If so, how?**
   
   We used copilot when coding to speed up the coding process. When we start writing the name of a function, copilot tries to guess what kind of code is needed. Sometimes the code it generates is functional, which we will adopt, and other times its code is not useful in which case we will just write our own code. 
2. **Did you use AI to create data sets or clean data sets? If so, how?**
   
   No we did not use AI to create data sets or clean data sets.
3. **Does your app use AI? If so, how?**
   
   Yes, our app uses OpenAI API for recipe generation, query validation, and string parsing. We also use Clarifai for image recognition of food ingredients.
4. **Did you encounter any limitations? What were they, and how did you overcome them? Be specific.**

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