import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // Порт, на котором будет работать Vue
    proxy: {
      // Все запросы к /api перенаправляем на Spring Boot
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Все запросы к /ws (WebSocket) тоже перенаправляем
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true, // Обязательно для WebSocket
        changeOrigin: true, // Добавь эту строк
      }
    }
  }
})
