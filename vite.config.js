import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Fix: Split vendor chunks (e.g., react, firebase, etc.)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor-react";
            if (id.includes("firebase")) return "vendor-firebase";
            return "vendor";
          }
        },
      },
    },
    // Optional: raise limit if absolutely necessary (but don't rely on this)
    chunkSizeWarningLimit: 4000, // optional — default is 500
  },
});
