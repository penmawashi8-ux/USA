import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        board: {
          dark: '#3d6b2e',
          light: '#d4c4a0',
          selected: '#f0c040',
          hint: '#4a9fe0',
        },
        forest: {
          deep: '#1a2f10',
          mid: '#2d4e1e',
          light: '#4a7c35',
        },
      },
      animation: {
        'bounce-slow': 'bounce 1.5s infinite',
        'pulse-fast': 'pulse 0.8s infinite',
      },
    },
  },
  plugins: [],
};
export default config;
