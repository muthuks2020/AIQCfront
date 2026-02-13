import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8005,
    open: true,
    allowedHosts: ['demo.eyehms.com'], 
  
    proxy: {
      '/api/v1': {
        target: 'https://ssei.eyehms.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
