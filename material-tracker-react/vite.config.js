import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // MODIFIED: Pass config directly to the plugin
    tailwindcss({
      config: {
        darkMode: 'class',
        content: [
          "./index.html",
          "./src/**/*.{js,ts,jsx,tsx}",
        ],
        theme: {
          extend: {
            fontFamily: {
              montserrat: ['Montserrat', 'sans-serif'],
            },
            colors: {
              'brand-blue': '#004aad',
              'brand-yellow': '#fdfe13',
            },
          },
        },
        plugins: [],
      }
    }),
  ],
})
