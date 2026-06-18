/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        serif: ['"Roboto Slab"', 'Georgia', 'serif'],
      },
      colors: {
        // Paleta institucional (verde-petroleo) - escala derivada de #105157
        brand: {
          50: '#edf5f5',
          100: '#d2e7e8',
          200: '#a6cfd1',
          300: '#6fafb2',
          400: '#3c898d',
          500: '#1a6b70',
          600: '#105157',
          700: '#0e4448',
          800: '#0c373a',
          900: '#0a2c2e',
          DEFAULT: '#105157',
          dark: '#0e4448',
        },
        // Tons neutros alinhados ao texto/fundos do site (#4D4C4C, #EEECEC...)
        ink: {
          DEFAULT: '#202121',
          soft: '#4d4c4c',
          muted: '#73757a',
        },
        sand: {
          50: '#fafafa',
          100: '#f6f6f6',
          200: '#eeecec',
          300: '#e2e0e0',
        },
        // Neutro institucional (sobrescreve o slate azulado padrao do Tailwind)
        slate: {
          50: '#f7f7f7',
          100: '#f1f0f0',
          200: '#e4e3e3',
          300: '#cfcdcd',
          400: '#a0a0a1',
          500: '#73757a',
          600: '#5b5a5a',
          700: '#4d4c4c',
          800: '#393c40',
          900: '#202121',
        },
      },
      boxShadow: {
        soft: '0 1px 3px rgba(16, 81, 87, 0.06), 0 1px 2px rgba(16, 81, 87, 0.04)',
        card: '0 4px 24px -8px rgba(16, 81, 87, 0.18)',
        glow: '0 0 0 1px rgba(16, 81, 87, 0.12), 0 8px 30px -12px rgba(16, 81, 87, 0.4)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        shimmer: 'shimmer 1.4s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
