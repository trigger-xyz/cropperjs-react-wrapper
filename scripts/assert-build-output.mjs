import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const distPath = resolve('dist');
const bundlePath = resolve('dist/index.js');
const declarationsPath = resolve('dist/index.d.ts');
const packagePath = resolve('package.json');
const bundle = readFileSync(bundlePath, 'utf8');
const declarations = readFileSync(declarationsPath, 'utf8');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

const expectedFiles = ['index.d.ts', 'index.js'];
const actualFiles = readdirSync(distPath, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort();

if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
  throw new Error(
    `Expected dist to contain only ${expectedFiles.join(', ')}, found: ${actualFiles.join(', ')}`,
  );
}

const expectedPackageEntries = {
  type: 'module',
  main: './dist/index.js',
  module: './dist/index.js',
  types: './dist/index.d.ts',
  exportImport: './dist/index.js',
  exportTypes: './dist/index.d.ts',
};
const actualPackageEntries = {
  type: packageJson.type,
  main: packageJson.main,
  module: packageJson.module,
  types: packageJson.types,
  exportImport: packageJson.exports?.['.']?.import,
  exportTypes: packageJson.exports?.['.']?.types,
};

if (
  JSON.stringify(actualPackageEntries) !==
  JSON.stringify(expectedPackageEntries)
) {
  throw new Error(
    `The public package entry points changed: ${JSON.stringify(actualPackageEntries)}`,
  );
}

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

if (!bundle.includes('import "cropperjs"')) {
  throw new Error(
    `Expected ${bundlePath} to keep Cropper.js as an external dependency.`,
  );
}

if (/\b(?:from|import)\s*\(?["']\.\.?\//.test(declarations)) {
  throw new Error(
    `Expected ${declarationsPath} to be self-contained without unpublished relative imports.`,
  );
}

const dom = new JSDOM('<!doctype html>');
for (const name of [
  'window',
  'document',
  'HTMLElement',
  'customElements',
  'Image',
  'CustomEvent',
  'Event',
  'MouseEvent',
  'PointerEvent',
  'TouchEvent',
  'WheelEvent',
  'Node',
  'Element',
]) {
  if (dom.window[name]) {
    globalThis[name] = dom.window[name];
  }
}

const expectedRuntimeExports = [
  'CropperCanvas',
  'CropperCrosshair',
  'CropperGrid',
  'CropperHandle',
  'CropperImage',
  'CropperSelection',
  'CropperShade',
  'CropperViewer',
  'useCustomEvents',
  'useForwardedRef',
].sort();
const builtModule = await import(pathToFileURL(bundlePath));
const actualRuntimeExports = Object.keys(builtModule).sort();

if (
  JSON.stringify(actualRuntimeExports) !==
  JSON.stringify(expectedRuntimeExports)
) {
  throw new Error(
    `The runtime export surface changed: ${actualRuntimeExports.join(', ')}`,
  );
}
