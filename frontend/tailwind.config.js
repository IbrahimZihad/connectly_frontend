/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5ff",
          100: "#dbe6ff",
          500: "#3b5bdb",
          600: "#2f49b5",
          700: "#26398f",
        },
      },
    },
  },
  plugins: [],
};
