import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { magenta: '#DB1AA0', amarelo: '#FFC851', roxo: '#2E0F4F', verde: '#2CC474', papel: '#FFF6E8' },
      fontFamily: {
        display: ['var(--f-display)', 'Impact', 'sans-serif'],
        pixel: ['var(--f-pixel)', 'monospace'],
        body: ['var(--f-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: { bloco: '4px 4px 0 #2E0F4F', blocom: '4px 4px 0 #DB1AA0' },
    },
  },
} satisfies Config;
