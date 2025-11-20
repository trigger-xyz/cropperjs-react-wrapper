import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  root: 'example',
  resolve: {
    alias: {
      'cropperjs-react-wrapper': resolve(__dirname, 'src'),
    },
  },
  server: {
    open: true,
  },
});
