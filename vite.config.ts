import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Frontend on 5173, proxy /api -> express key-safe server on 8787.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // expose on LAN
    allowedHosts: true, // allow tunnel hostnames (localtunnel/cloudflare)
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})
