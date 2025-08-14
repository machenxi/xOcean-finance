import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
      events: 'events',
      util: 'util',
      stream: 'stream',
      crypto: 'crypto-browserify',
      process: 'process/browser',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': '{}',
    Buffer: 'Buffer',
  },
  optimizeDeps: {
    include: ['xrpl', 'buffer', 'events', 'util', 'stream', 'crypto-browserify', 'process'],
  },
})