/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        airforce: {
          50: '#f0f6fa',
          100: '#dfedf5',
          200: '#c4dceb',
          300: '#9ac3dc',
          400: '#6aa5cb',
          500: '#4789b8', // Air Force Blue primary
          600: '#356e9c',
          700: '#2b577e',
          800: '#264867',
          900: '#243e56',
          950: '#152637',
          DEFAULT: '#4789b8',
        },
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
