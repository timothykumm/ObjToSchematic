import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      include: ['path', 'util', 'stream', 'events', 'string_decoder', 'buffer', 'process', 'zlib', 'assert'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      overrides: {
        module: 'empty',
      },
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
    extensions: ['.ts', '.js', '.vue', '.json']
  },
  assetsInclude: [
    '**/*.atlas',
    '**/*.png'
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  },
  worker: {
    format: 'es'
  },
  server: {
    port: 8080,
    hot: true
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})