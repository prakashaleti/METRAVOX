/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0052cc',
          600: '#0041a8',
          700: '#003380',
          800: '#002257',
          900: '#001438',
        },
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#0f766e',
          600: '#0d9488',
          700: '#047857',
          800: '#065f46',
          900: '#134e4a',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px -2px rgba(0, 0, 0, 0.05), 0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 30px -5px rgba(0, 20, 56, 0.08)',
      }
    },
  },
  plugins: [],
}
