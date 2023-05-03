/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

const config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: true,
  mode: 'jit',
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', ...defaultTheme.fontFamily.sans],
      },
      dropShadow: {
        logo: ['0 0 1.5px rgb(255 255 255 / 0.5)'],
        vrLogo: ['0px -1px 3px rgb(255 255 255 / 1)'],
      },
    },
  },
  plugins: [],
}

module.exports = config
