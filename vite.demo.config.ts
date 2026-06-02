import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'example/vite'),
  resolve: {
    alias: {
      'cropperjs-react-wrapper': resolve(__dirname, 'src'),
    },
  },
  server: {
    open: true,
  },
});
