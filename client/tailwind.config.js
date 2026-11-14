/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F8F7F2',
          soft: '#EFEEE7',
        },
        midnight: {
          DEFAULT: '#17191C',
          light: '#252930',
          muted: '#666F7B',
        },
        lime: {
          neon: '#C5F36A',
          hover: '#b4e851',
          light: '#eefbce',
          glow: 'rgba(197, 243, 106, 0.25)',
        },
        border: {
          neutral: '#DEDED5',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
