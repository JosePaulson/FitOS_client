import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// A fresh value every time `vite build` runs — baked into the bundle via
// `define`, and also written to dist/version.json (a plain static file
// always reflecting whatever's actually deployed). The update-checker
// compares the two to detect a new deploy.
const BUILD_VERSION = String(Date.now())

function versionFilePlugin() {
  return {
    name: 'write-version-json',
    apply: 'build',
    writeBundle(options) {
      fs.writeFileSync(
        path.join(options.dir || 'dist', 'version.json'),
        JSON.stringify({ version: BUILD_VERSION })
      )
    },
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(BUILD_VERSION),
  },
  plugins: [react(), versionFilePlugin()],
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
