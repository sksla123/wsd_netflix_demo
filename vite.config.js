import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: 4200
  },
  base: "/wsd_netflix_demo/",
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
