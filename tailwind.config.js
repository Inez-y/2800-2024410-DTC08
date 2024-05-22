/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./views/**/*.{html,js,ejs}", "./test.html"],
  theme: {
    extend: {
      fontFamily: {
        'Poppins': ['"Poppins"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'buttongreen': '#779341',
        'lightGrey': '#9A9BB1',
      },
      backgroundImage: {
        'backgroundImage': "url('/public/background1.jpeg')",
      }
    },
  },
  plugins: [],
};