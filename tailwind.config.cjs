/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,svelte,ts,js}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      colors: {
        ink: '#0f172a',
        paper: '#0b1220',
        accent: '#38bdf8',
        highlight: '#f59e0b'
      }
    }
  },
  plugins: []
};
