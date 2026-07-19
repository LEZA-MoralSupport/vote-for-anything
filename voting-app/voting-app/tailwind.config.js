/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B1712',
        paper: '#FBFAF7',
        plum: {
          50: '#FBF1F4',
          100: '#F3D9E1',
          400: '#B0466E',
          500: '#8C2E52',
          600: '#701F40',
          700: '#571633',
        },
        gold: {
          300: '#EAC77E',
          400: '#D4A24E',
          500: '#B8843A',
        },
        line: '#E7E1D6',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,23,18,0.06), 0 8px 24px -12px rgba(27,23,18,0.12)',
        stamp: '0 0 0 3px rgba(112,31,64,0.15)',
      },
      keyframes: {
        stamp: {
          '0%': { transform: 'scale(2.2) rotate(-14deg)', opacity: '0' },
          '55%': { transform: 'scale(0.92) rotate(-14deg)', opacity: '1' },
          '75%': { transform: 'scale(1.06) rotate(-14deg)' },
          '100%': { transform: 'scale(1) rotate(-14deg)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        sparkle: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '25%': { opacity: '1' },
          '100%': { transform: 'scale(1.3) rotate(80deg) translateY(var(--sparkle-y, -20px)) translateX(var(--sparkle-x, 0px))', opacity: '0' },
        },
      },
      animation: {
        stamp: 'stamp 0.45s cubic-bezier(.2,.8,.3,1.2) forwards',
        'fade-up': 'fade-up 0.3s ease-out forwards',
        sparkle: 'sparkle 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
}
