/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#020408',
          900: '#0a0f1e',
          800: '#0d1526',
          700: '#111c35',
          600: '#162244',
          500: '#1a2850',
        },
        electric: {
          500: '#0ea5e9',
          400: '#38bdf8',
          300: '#7dd3fc',
        },
        cyan: {
          400: '#22d3ee',
          300: '#67e8f9',
        },
        status: {
          green: '#22c55e',
          yellow: '#eab308',
          red: '#ef4444',
          'green-dim': '#166534',
          'yellow-dim': '#713f12',
          'red-dim': '#7f1d1d',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateY(-8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      }
    }
  },
  plugins: []
}
