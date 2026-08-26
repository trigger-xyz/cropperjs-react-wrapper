/// <reference types="vitest" />

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'cropperjs',
];

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactCropper',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external,
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react/jsx-dev-runtime': 'ReactJSXDevRuntime',
          cropperjs: 'Cropper',
        },
      },
    },
  },
  test: {
    globals: true,
    dir: './src',
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
