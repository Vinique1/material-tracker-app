// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create a separate chunk for Firebase
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          // Create a separate chunk for headless-ui
          if (id.includes('node_modules/@headlessui')) {
            return 'headlessui';
          }
        },
      },
    },
  },
});