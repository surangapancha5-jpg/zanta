import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/hirunews': {
          target: 'https://api.chamindu.site',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/hirunews/, '/api/v1/media/hirunews'),
        },
        '/api/nova': {
          target: 'https://supunofc.site',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/nova/, '/api/ai/ai/nova'),
        },
      },
    },
  };
});
