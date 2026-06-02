import { dts } from 'rollup-plugin-dts';

export default {
  input: 'src/index.ts',
  output: { file: 'dist/index.d.ts', format: 'es' },
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'cropperjs',
  ],
  plugins: [dts({ tsconfig: './tsconfig.build.json' })],
};
