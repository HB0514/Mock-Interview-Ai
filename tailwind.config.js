/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#070b14',
          800: '#0d1220',
          700: '#141927',
          600: '#1a2235',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(99, 102, 241, 0.3)',
      }
    },
  },
  plugins: [],
}
