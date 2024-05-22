// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./views/**/*.{html,js,ejs}"],
  theme: {
    extend: {
      fontFamily: {
        'Poppins': ['"Poppins"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'buttongreen': '#779341',
        'lightGrey': '#9A9BB1',
        'warning': '#FF0000',
      },
      backgroundImage: {
        'custom-bg': "url('/background1.jpeg')", // Ensure the correct path
      },
    },
  },
  variants: {},
  plugins: [],
};
