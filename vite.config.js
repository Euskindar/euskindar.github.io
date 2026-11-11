// Vite config for euskindar.github.io with PWA support
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Euskindar GitHub Site',
        short_name: 'Euskindar',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 500
  }
});