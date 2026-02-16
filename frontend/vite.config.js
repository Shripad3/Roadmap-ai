/**
 * Vite Configuration
 * 
 * Vite is a fast build tool for modern web development.
 * This config sets up React and defines how the app is built.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 5173,
    // Proxy API requests to backend during development
    // This avoids CORS issues and simulates production routing
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true, // Helpful for debugging production issues
  }
});
