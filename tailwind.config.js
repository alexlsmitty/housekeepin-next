// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}", // Include files in the app directory
      "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Include files in pages directory (if you have one)
      "./components/**/*.{js,ts,jsx,tsx,mdx}", // Include files in the components directory
    ],
    theme: {
      extend: {
        // You can extend the default theme here if needed
        // Example:
        // colors: {
        //   'brand-blue': '#1DA1F2',
        // },
      },
    },
    plugins: [],
  }