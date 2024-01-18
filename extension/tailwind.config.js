/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./angular/src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js" // add this line
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}