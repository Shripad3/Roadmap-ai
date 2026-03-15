/**
 * Vite Configuration
 * 
 * Vite is a fast build tool for modern web development.
 * This config sets up React and defines how the app is built.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Roadmap AI',
        short_name: 'Roadmap AI',
        description: 'AI-powered task manager',
        theme_color: '#6366f1',
        background_color: '#f9fafb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/today',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  
  server: {
    port: 5173,
    strictPort: true, // Error instead of silently picking a different port (prevents CORS mismatch)
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
