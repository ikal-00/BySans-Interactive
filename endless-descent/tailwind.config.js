/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stake: {
          dark: '#0f212e',
          card: '#1a2c38',
          input: '#213743',
          border: '#2f4553',
          green: '#00e701',
          red: '#e9113c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      }
    },
  },
  plugins: [],
}