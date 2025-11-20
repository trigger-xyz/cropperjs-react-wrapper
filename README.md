# Cropper.js React

A modern, lightweight React wrapper for [Cropper.js v2](https://github.com/fengyuanchen/cropperjs).

## Features

- ⚛️ **React 18+ Support**: Built for modern React applications.
- 📦 **Cropper.js v2**: Fully embraces the Web Components architecture of Cropper.js 2.0.
- 🧩 **Component-Based**: Compose your cropper using individual components (`CropperCanvas`, `CropperImage`, `CropperSelection`, etc.) for maximum flexibility.
- 🟦 **TypeScript**: Fully typed for excellent developer experience.
- 🚀 **ESM Only**: Modern module format.

## Installation

```bash
npm install cropperjs-react-wrapper cropperjs
# or
yarn add cropperjs-react-wrapper cropperjs
# or
pnpm add cropperjs-react-wrapper cropperjs
# or
bun add cropperjs-react-wrapper cropperjs
```

## Usage

### Basic Example

Compose the components to build your cropping interface. This gives you full control over the layout and behavior.

```tsx
import React from 'react';
import {
  CropperCanvas,
  CropperImage,
  CropperSelection,
  CropperHandle,
  CropperGrid,
  CropperCrosshair,
} from 'cropperjs-react-wrapper';

const App = () => {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <CropperCanvas background>
        <CropperImage
          src="https://fengyuanchen.github.io/cropperjs/images/picture.jpg"
          alt="Picture"
          rotatable
          scalable
          skewable
          translatable
        />
        <CropperSelection initialCoverage={0.5} movable resizable zoomable>
          <CropperGrid role="grid" covered bordered />
          <CropperCrosshair centered />
          <CropperHandle action="move" themeColor="rgba(255, 255, 255, 0.35)" />
          <CropperHandle action="n-resize" />
          <CropperHandle action="e-resize" />
          <CropperHandle action="s-resize" />
          <CropperHandle action="w-resize" />
          <CropperHandle action="ne-resize" />
          <CropperHandle action="nw-resize" />
          <CropperHandle action="se-resize" />
          <CropperHandle action="sw-resize" />
        </CropperSelection>
      </CropperCanvas>
    </div>
  );
};

export default App;
```

### Components

The library exports React components that wrap the corresponding Cropper.js 2.0 custom elements:

| Component | Cropper.js Element | Description |
| --- | --- | --- |
| `CropperCanvas` | `<cropper-canvas>` | The main container for the cropper. |
| `CropperImage` | `<cropper-image>` | The image to be cropped. Supports transformations. |
| `CropperSelection` | `<cropper-selection>` | The crop box selection area. |
| `CropperGrid` | `<cropper-grid>` | A grid displayed within the selection. |
| `CropperCrosshair` | `<cropper-crosshair>` | A crosshair displayed within the selection. |
| `CropperHandle` | `<cropper-handle>` | Interactive handles for resizing or moving the selection. |
| `CropperShade` | `<cropper-shade>` | An overlay shade for the non-selected area. |

### Accessing Methods

You can access the underlying DOM elements and their methods (like `$rotate`, `$scale`, `$toCanvas`) using React refs.

```tsx
import { useRef } from 'react';
import { CropperImage, type CropperImageElement } from 'cropperjs-react-wrapper';

const App = () => {
  const imageRef = useRef<CropperImageElement>(null);

  const handleRotate = () => {
    imageRef.current?.$rotate('90deg');
  };

  return (
    <>
      <button onClick={handleRotate}>Rotate</button>
      <CropperCanvas>
        <CropperImage ref={imageRef} src="..." />
        {/* ... */}
      </CropperCanvas>
    </>
  );
};
```

## Development

### Commands

- `npm run dev`: Start the development server (includes a demo app).
- `npm run build`: Build the library.
- `npm run test`: Run tests using Vitest.
- `npm run lint`: Run linting using Biome.

## License

MIT