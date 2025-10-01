import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/admin/'
  server: {
    allowedHosts: ['dev.usebyteme.com'],
    port: 4173,
    host: true,
  },
  preview: {
    allowedHosts: ['dev.usebyteme.com'],
    port: 4173,
    host: true,
  },
})

