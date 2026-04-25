import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React vendor
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('axios') || id.includes('date-fns') || id.includes('react-hot-toast') || id.includes('react-icons')) {
              return 'vendor-utils';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500
  }
})