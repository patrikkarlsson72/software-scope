/// <reference types="node" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load package.json to get version
  const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
  
  return {
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },

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
  }
}) 