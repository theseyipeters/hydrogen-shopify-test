import type {Config} from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{js,ts,jsx,tsx}', './index.html'],
  plugins: [],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#142828',
          creme: '#E9DBDB',
        },
      },
      fontFamily: {
        quicksand: ['Quicksand', 'serif'],
      },
    },
  },
};

export default config;
