/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        transit: {
          green: "#047857",
          red: "#dc2626",
          ev: "#0284c7",
          pink: "#db2777"
        }
      }
    },
  },
  plugins: [],
};
