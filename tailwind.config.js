// tailwind.config.js
export default {
  darkMode: "selector", // <--- THIS IS THE KEY
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        "brand-blue": "#004aad",
        "brand-yellow": "#fdfe13",
      },
    },
  },
  plugins: [],
};
