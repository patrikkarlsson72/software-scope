/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Vite options tailored for Tauri development
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: (process.env as any).TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !(process.env as any).TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!(process.env as any).TAURI_DEBUG,
  },
}) 