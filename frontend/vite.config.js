import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()
const targe = `http://localhost:${process.env.PORT || 5000}`


export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        
        target: targe,
        changeOrigin: true
      }
    }
  }
})
