import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['"Geist"', '"Geist Fallback"', 'system-ui', 'sans-serif'],
        mono:  ['"Geist Mono"', 'monospace'],
      },
      colors: {
        /* Map CSS vars to Tailwind tokens */
        bg:       'hsl(var(--bg))',
        subtle:   'hsl(var(--bg-subtle))',
        raised:   'hsl(var(--bg-raised))',
        overlay:  'hsl(var(--bg-overlay))',
        border:   'hsl(var(--border))',
        fg:       'hsl(var(--fg))',
        'fg-muted': 'hsl(var(--fg-muted))',
        'fg-subtle':'hsl(var(--fg-subtle))',
        primary:  'hsl(var(--primary))',
        profit:   'hsl(var(--profit))',
        loss:     'hsl(var(--loss))',
        /* Aliases */
        background: 'hsl(var(--bg))',
        foreground: 'hsl(var(--fg))',
        card:       'hsl(var(--bg-raised))',
        secondary:  'hsl(var(--bg-overlay))',
        muted:      'hsl(var(--bg-subtle))',
        'muted-foreground': 'hsl(var(--fg-muted))',
        accent:     'hsl(var(--bg-overlay))',
        input:      'hsl(var(--bg-overlay))',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 2px)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) + 2px)',
        xl: 'calc(var(--radius) + 4px)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.45' },
        },
      },
      animation: {
        'fade-up':  'fadeUp 0.25s ease-out both',
        'shimmer':  'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
