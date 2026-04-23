/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        background: 'hsl(222 47% 6%)',
        surface: 'hsl(222 47% 9%)',
        'surface-elevated': 'hsl(222 47% 12%)',
        border: 'hsl(222 30% 18%)',
        'border-subtle': 'hsl(222 30% 14%)',
        primary: {
          DEFAULT: 'hsl(199 89% 48%)',
          dim: 'hsl(199 89% 30%)',
        },
        safe: 'hsl(142 71% 45%)',
        warning: 'hsl(38 92% 50%)',
        critical: 'hsl(0 84% 60%)',
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        heartbeat: 'heartbeat 1s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};