import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const bundlePath = resolve('dist/index.js');
const bundle = readFileSync(bundlePath, 'utf8');

const forbiddenSnippets = [
  'node_modules/react/cjs/react-jsx-runtime',
  'node_modules/react/cjs/react-jsx-dev-runtime',
  'require("react")',
  "require('react')",
  'typeof require',
];

for (const snippet of forbiddenSnippets) {
  if (bundle.includes(snippet)) {
    throw new Error(
      `Unexpected bundled React runtime marker in ${bundlePath}: ${snippet}`,
    );
  }
}

if (!bundle.includes('react/jsx-runtime')) {
  throw new Error(
    `Expected ${bundlePath} to import react/jsx-runtime as an external dependency.`,
  );
}
