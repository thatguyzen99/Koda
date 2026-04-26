import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A2540',
          50: '#E6EAF0',
          100: '#C7D0DD',
          200: '#94A4BD',
          300: '#62789C',
          400: '#2F4D7B',
          500: '#0A2540',
          600: '#081D33',
          700: '#061626',
          800: '#040E1A',
          900: '#02070D',
        },
        accent: {
          DEFAULT: '#635BFF',
          50: '#EFEEFF',
          100: '#DEDDFE',
          200: '#BDB9FE',
          300: '#9C95FD',
          400: '#7B72FC',
          500: '#635BFF',
          600: '#4F44E6',
          700: '#3E33C9',
          800: '#2E25A1',
          900: '#1D1773',
        },
        magenta: {
          DEFAULT: '#EC4899',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
        },
        sky: {
          DEFAULT: '#0EA5E9',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F6F9FC',
        surface: '#FFFFFF',
        ink: '#0A2540',
        muted: '#64748B',
      },
      fontFamily: {
        heading: ['var(--font-urbanist)', 'Urbanist', 'sans-serif'],
        body: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        urbanist: ['var(--font-urbanist)', 'Urbanist', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        'card': '0 4px 12px -2px rgb(15 23 42 / 0.06), 0 2px 4px -1px rgb(15 23 42 / 0.04)',
        'card-hover': '0 12px 24px -8px rgb(99 91 255 / 0.18), 0 4px 8px -2px rgb(15 23 42 / 0.06)',
        'glow-accent': '0 0 0 1px rgb(99 91 255 / 0.2), 0 8px 24px -4px rgb(99 91 255 / 0.4)',
        'glow-magenta': '0 0 0 1px rgb(236 72 153 / 0.2), 0 8px 24px -4px rgb(236 72 153 / 0.4)',
        'inner-line': 'inset 0 1px 0 0 rgb(255 255 255 / 0.5)',
      },
      backgroundImage: {
        // Official Koda brand gradient — matches the SVG mark exactly.
        'gradient-koda':
          'linear-gradient(135deg, #4d285a 3%, #785e9f 29%, #ae87bd 48%, #c7afd4 65%, #d59fb2 76%, #e3bcad 88%, #f7cf87 100%)',
        'gradient-vibrant':
          'linear-gradient(135deg, #635BFF 0%, #7C5CFF 35%, #A855F7 65%, #EC4899 100%)',
        'gradient-cool':
          'linear-gradient(135deg, #635BFF 0%, #0EA5E9 100%)',
        'gradient-warm':
          'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F59E0B 100%)',
        'gradient-navy':
          'linear-gradient(180deg, #0A2540 0%, #0F2F4F 100%)',
        'aurora':
          'radial-gradient(at 18% 12%, rgba(99,91,255,0.18) 0px, transparent 55%), radial-gradient(at 82% 8%, rgba(236,72,153,0.12) 0px, transparent 50%), radial-gradient(at 65% 88%, rgba(14,165,233,0.14) 0px, transparent 55%), radial-gradient(at 12% 92%, rgba(168,85,247,0.10) 0px, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer': 'shimmer 2.4s linear infinite',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,91,255,0.45)' },
          '50%': { boxShadow: '0 0 0 16px rgba(99,91,255,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '33%': { transform: 'translateY(-10px) translateX(8px)' },
          '66%': { transform: 'translateY(6px) translateX(-6px)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
