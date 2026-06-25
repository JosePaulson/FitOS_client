import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All /api requests forwarded to Express in dev — no CORS needed
      '/api': {
        target: 'https://fitos-server.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
