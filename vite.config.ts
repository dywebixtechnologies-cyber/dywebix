import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  console.log('BUILD-TIME ENV CHECK:', {
    VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY ? 'FOUND' : 'MISSING',
    VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID ? 'FOUND' : 'MISSING',
    VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN ? 'FOUND' : 'MISSING',
  });
  return {
    plugins: [react(), tailwindcss()],
    // Treat .glb 3D models as static assets (used by the Lanyard component).
    assetsInclude: ['**/*.glb'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
