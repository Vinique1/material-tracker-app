// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// This is the entire corrected file content.
export default defineConfig({
  plugins: [
    react(),
    // The plugin will now automatically find and use your tailwind.config.js
    tailwindcss(),
  ],
});