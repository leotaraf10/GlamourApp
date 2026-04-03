/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-taupe': '#8D7B68',
        'brand-beige': '#FAF8F5',
        'brand-noir': '#111111',
      },
      fontFamily: {
        elegant: ['"Playfair Display"', 'serif'],
        sans: ['Lato', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.8s ease-out forwards',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
}
