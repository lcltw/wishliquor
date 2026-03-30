/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        whisky: {
          dark: '#ffffff',
          darker: '#ffffff',
          accent: '#C9A227',
          accentHover: '#D4AF37',
          text: '#333333',
          muted: '#666666',
          card: '#f5f5f5',
          border: '#dddddd',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
