# Cropper.js React

A modern, lightweight React wrapper for [Cropper.js v2](https://github.com/fengyuanchen/cropperjs).

## Features

- ⚛️ **React 18+ Support**: Built for modern React applications.
- 📦 **Cropper.js 2.2**: Supports the latest Web Components API, including image fit limits and cancelable image change events.
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
          initialFit="contain"
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

The library exports React components that wrap the corresponding Cropper.js 2.2 custom elements:

| Component | Cropper.js Element | Description |
| --- | --- | --- |
| `CropperCanvas` | `<cropper-canvas>` | The main container for the cropper. |
| `CropperImage` | `<cropper-image>` | The image to be cropped. Supports transformations. |
| `CropperSelection` | `<cropper-selection>` | The crop box selection area. |
| `CropperGrid` | `<cropper-grid>` | A grid displayed within the selection. |
| `CropperCrosshair` | `<cropper-crosshair>` | A crosshair displayed within the selection. |
| `CropperHandle` | `<cropper-handle>` | Interactive handles for resizing or moving the selection. |
| `CropperShade` | `<cropper-shade>` | An overlay shade for the non-selected area. |
| `CropperViewer` | `<cropper-viewer>` | A live view of a cropper selection. |

### Accessing Methods

You can access the underlying DOM elements and their methods (like `$rotate`, `$scale`, `$toCanvas`) using React refs.

```tsx
import type { CropperImage as CropperImageElement } from 'cropperjs';
import { useRef } from 'react';
import { CropperCanvas, CropperImage } from 'cropperjs-react-wrapper';

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

## Cropper.js 2.2 image sizing

Cropper.js 2.2 replaces `initialCenterSize` with `initialFit` and adds optional minimum and maximum fit limits. The deprecated `initialCenterSize` prop remains available for compatibility.

`CropperImage` also exposes the native image properties supported by Cropper.js: `crossOrigin`, `decoding`, `elementTiming`, `fetchPriority`, `loading`, `referrerPolicy`, `sizes`, and `srcSet`. Every wrapper exposes the shared `slottable` property.

```tsx
<CropperImage
  initialFit="cover"
  minFit="contain"
  maxFit="none"
  onChange={(event) => {
    console.log(event.detail);
    // Prevent the pending size or position change when needed.
    // event.preventDefault();
  }}
/>
```

## Typed action events

Canvas and selection action handlers expose typed Cropper.js event details. Depending on the action, these include pointer coordinates, scaling, rotation, and the Cropper.js 2.2 transform center.

```tsx
import type { CropperActionEvent } from 'cropperjs-react-wrapper';

const handleAction = (event: CropperActionEvent) => {
  const { action, scale, rotate, centerX, centerY } = event.detail;

  if (action === 'scale') {
    console.log({ scale, centerX, centerY });
  }

  // Cancel the pending Cropper.js action when needed.
  // event.preventDefault();
};

<CropperCanvas onAction={handleAction}>{/* ... */}</CropperCanvas>;
```

The package also exports `CropperActionStartEvent`, `CropperActionMoveEvent`, `CropperActionEndEvent`, and their detail types.

## Development

Repository development and CI use npm. The Bun command above is provided for consumers installing the published package.

### Commands

- `npm run dev`: Start the Vite demo app from `example/vite`.
- `npm run dev:vite`: Start the Vite demo app.
- `npm run dev:nextjs`: Build the package and start the Next.js fixture from `example/nextjs`.
- `npm run build`: Build the library and assert that React JSX runtimes stay external.
- `npm run build:examples`: Build the library, then build all example workspaces through Turbo.
- `npm run test`: Run tests using Vitest.
- `npm run test:all`: Run the main suite and compatibility-fixture tests once.
- `npm run typecheck`: Typecheck the built library and all workspaces.
- `npm run lint`: Run linting using Biome.

### Examples

- `example/vite`: Interactive Vite demo for local wrapper development.
- `example/react18`: React 18 compatibility fixture with production-build and type checks.
- `example/nextjs`: Next.js App Router fixture for browser module evaluation and packaging regressions.

## License

MIT
