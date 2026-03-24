/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      zIndex: { 60: '60', 70: '70' },
    },
  },
  plugins: [],
};
