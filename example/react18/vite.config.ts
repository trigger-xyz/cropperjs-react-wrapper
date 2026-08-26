import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'cropperjs-react-wrapper': resolve(currentDirectory, '../../src'),
      react: resolve(currentDirectory, 'node_modules/react'),
      'react-dom': resolve(currentDirectory, 'node_modules/react-dom'),
    },
  },
  test: {
    environment: 'jsdom',
  },
});
