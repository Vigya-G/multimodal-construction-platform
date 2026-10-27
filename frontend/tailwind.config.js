/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#080d19',
        surface: '#0d1527',
        card: '#101b33',
        cardBorder: '#1c2d4f',
        muted: '#94a3b8',
        accentYellow: '#f59e0b',
        // High-precision industrial tokens
        brand: {
          darkest: '#060a13',
          dark: '#0a101f',
          surface: '#0e172c',
          card: '#121d38',
          border: '#1e2f56',
          borderHover: '#2a4175',
          accent: '#f59e0b',
          accentHover: '#d97706',
          accentLight: '#fef3c7',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(2, 6, 23, 0.5), 0 0 0 1px rgba(30, 47, 86, 0.4)',
        'panel-hover': '0 8px 28px -4px rgba(2, 6, 23, 0.65), 0 0 0 1px rgba(42, 65, 117, 0.6)',
        'hud': '0 0 15px rgba(245, 158, 11, 0.15)',
      },
    },
  },
  plugins: [],
}
