/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts,jsx,js}", "./dist/**/*.{tsx,ts,jsx,js}"],
  theme: {
    extend: {
      extend: {
        fontFamily: {
          prompt: ["Prompt", "sans-serif"],
        },
      },
    },
  },
  plugins: [],
};
