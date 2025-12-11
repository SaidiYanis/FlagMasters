import { defineConfig } from 'electron-vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    entry: 'src/main/main.js',
    vite: {
      build: {
        rollupOptions: {
          external: []
        }
      }
    }
  },
  preload: {
    input: {
      preload: resolve(__dirname, 'src/preload/preload.js')
    },
    vite: {
      optimizeDeps: {
        include: ['firebase/app', 'firebase/auth']
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html')
      }
    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer')
      }
    }
  }
})
