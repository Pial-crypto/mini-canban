import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6fe',
          200: '#bfd2fe',
          300: '#93b4fd',
          400: '#5f8bf9',
          500: '#3b66f3',
          600: '#2547e6',
          700: '#1e37c6',
          800: '#1f31a0',
          900: '#1f2f7d',
        },
      },
    },
  },
  plugins: [],
};

export default config;
