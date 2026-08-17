/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Catches standard root directories
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Catches everything if you used the 'src' directory during setup
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        transit: {
          green: "#047857",
          red: "#dc2626",
          ev: "#0284c7",
          orange: "#ea580c"
        }
      }
    },
  },
  plugins: [],
};
