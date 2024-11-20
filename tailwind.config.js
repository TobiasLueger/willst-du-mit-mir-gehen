/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        float: 'float 3s ease-in-out infinite',
        heart: 'heart 30s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        heart: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-800px) scale(0)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
