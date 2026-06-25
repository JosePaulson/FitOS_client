/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black:    '#0D0D0D',
        lime:     '#C8F135',
        'lime-dark': '#a8cc1f',
        cream:    '#F5F4EF',
        muted:    '#888880',
        card:     '#161616',
        ink:      '#0a0a0a',
        border:   'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(44px,7vw,88px)', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '900' }],
        'display': ['clamp(30px,4vw,48px)', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '800' }],
      },
      animation: {
        'pulse-dot': 'pulseDot 2s infinite',
        'fade-up':   'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.5', transform: 'scale(0.8)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'grid-lime': `
          linear-gradient(rgba(200,241,53,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,241,53,0.03) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
    },
  },
  plugins: [],
}
