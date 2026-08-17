/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Next.js App Directory
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Components Directory
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // If you placed data files that include Tailwind class strings (like our badge colors)
    "./data/**/*.{js,ts,jsx,tsx}",
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
