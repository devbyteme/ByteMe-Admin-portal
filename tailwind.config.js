/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
              colors: {
          primary: {
            50: '#FEFBEA',
            100: '#FEF7D5',
            200: '#FEEFB0',
            300: '#FEE78B',
            400: '#FEDF66',
            500: '#FE4B11', // Primary brand color
            600: '#E5440F',
            700: '#CC3D0D',
            800: '#B2360B',
            900: '#992F09',
          },
          brand: {
            primary: '#FE4B11',    // Orange - Primary brand color
            secondary: '#FEFBEA',  // Light cream
            white: '#FFFFFF',      // Pure white
            dark: '#211E1D',      // Dark charcoal
          },
          sidebar: {
            DEFAULT: '#211E1D',   // Dark charcoal
            foreground: '#FEFBEA', // Light cream
            accent: '#FE4B11',     // Orange accent
          },
        },
    },
  },
  plugins: [],
}
