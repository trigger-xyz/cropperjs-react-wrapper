# Cropper.js React

A modern, lightweight React wrapper for [Cropper.js v2](https://github.com/fengyuanchen/cropperjs).

## Features

- ⚛️ **React Support**: Compatible with React 18 and React 19.
- 📦 **Cropper.js v2**: Image transformations, crop constraints, and live previews.
- 🧩 **Component-Based**: Compose your cropper from image, selection, handle, and preview components.
- 🟦 **TypeScript**: Fully typed props, refs, and events.
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

```tsx
import {
  CropperCanvas,
  CropperImage,
  CropperSelection,
  CropperHandle,
  CropperGrid,
  CropperCrosshair,
} from "cropperjs-react-wrapper";

export default function App() {
  return (
    <div style={{ width: "100%", height: 400 }}>
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
          <CropperHandle action="ne-resize" />
          <CropperHandle action="nw-resize" />
          <CropperHandle action="se-resize" />
          <CropperHandle action="sw-resize" />
        </CropperSelection>
      </CropperCanvas>
    </div>
  );
}
```

### Components

Each component wraps a Cropper.js custom element:

| Component          | Cropper.js Element    | Description                                               |
| ------------------ | --------------------- | --------------------------------------------------------- |
| `CropperCanvas`    | `<cropper-canvas>`    | The main container for the cropper.                       |
| `CropperImage`     | `<cropper-image>`     | The image to be cropped. Supports transformations.        |
| `CropperSelection` | `<cropper-selection>` | The crop box selection area.                              |
| `CropperGrid`      | `<cropper-grid>`      | A grid displayed within the selection.                    |
| `CropperCrosshair` | `<cropper-crosshair>` | A crosshair displayed within the selection.               |
| `CropperHandle`    | `<cropper-handle>`    | Interactive handles for resizing or moving the selection. |
| `CropperShade`     | `<cropper-shade>`     | An overlay shade for the non-selected area.               |
| `CropperViewer`    | `<cropper-viewer>`    | A live view of a cropper selection.                       |

### Accessing Methods

Use React refs to access methods such as `$rotate`, `$scale`, and `$toCanvas`.

```tsx
import type { CropperImage as CropperImageElement } from "cropperjs";
import { useRef } from "react";
import { CropperCanvas, CropperImage } from "cropperjs-react-wrapper";

function RotateExample() {
  const imageRef = useRef<CropperImageElement>(null);

  return (
    <>
      <button onClick={() => imageRef.current?.$rotate("90deg")}>Rotate</button>
      <CropperCanvas>
        <CropperImage ref={imageRef} src="/photo.jpg" rotatable />
      </CropperCanvas>
    </>
  );
}
```

## Image Sizing

Use `initialFit` to fit the image to its canvas, `minFit` and `maxFit` to limit its size, and inset limits to constrain its position.

`CropperImage` also exposes the native image properties supported by Cropper.js: `crossOrigin`, `decoding`, `elementTiming`, `fetchPriority`, `loading`, `referrerPolicy`, `sizes`, and `srcSet`. Every wrapper exposes the shared `slottable` property.

```tsx
<CropperImage
  src="/photo.jpg"
  initialFit="cover"
  minFit="contain"
  maxFit="none"
/>
```

## Selection and Image Controls

| Component          | Props                                    | Default                                     |
| ------------------ | ---------------------------------------- | ------------------------------------------- |
| `CropperImage`     | `minInset`, `maxInset`                   | `"auto"`                                    |
| `CropperImage`     | `zoomAroundCenter`                       | `false`                                     |
| `CropperSelection` | `minInset`, `maxInset`                   | `"auto"`                                    |
| `CropperSelection` | `resizeAroundCenter`, `zoomAroundCenter` | `false`                                     |
| `CropperSelection` | `borderRadius`                           | `""`                                        |
| `CropperShade`     | `borderRadius`                           | Follows the selection when connected to one |

Insets constrain distances to the parent edges using CSS inset syntax: pixels, percentages, `calc()`, or `auto` for no limit. Set `minInset="0"` to keep an element inside its parent or `maxInset="0"` to require full coverage. Changes outside these limits are rejected. Use `bounded` to constrain the selection to the image rectangle instead.

`initialCoverage` uses image bounds when available and preserves explicit selection dimensions, so initialization may finish after loading.

```tsx
<CropperCanvas background style={{ height: 400 }}>
  <CropperImage src="/photo.jpg" scalable translatable zoomAroundCenter />
  <CropperShade />
  <CropperSelection
    initialCoverage={0.5}
    aspectRatio={1}
    minInset="0"
    borderRadius="50%"
    movable
    resizable
    resizeAroundCenter
    zoomable
    zoomAroundCenter
  >
    <CropperHandle action="move" />
    <CropperHandle action="se-resize" />
  </CropperSelection>
</CropperCanvas>
```

`borderRadius` clips the selection and its `$toCanvas()` output. The shade and viewer follow its radius. Export as PNG or WebP to preserve transparent corners.

## Image Loading and Previews

For image sources supplied after mount, render `CropperViewer` after the image's `onReady` callback fires. Readiness runs again when `src` or `srcSet` changes; pending callbacks are canceled on unmount.

Changing a viewer's `selection` or `resize` prop reconnects its element and updates the ref. Viewers also work with non-interactive images and retain the accepted crop when a change is canceled.

Keep the same `CropperImage` element when changing source or fit props. Changing only its React `key` can leave exports attached to the previous element. If replacing it, remount the canvas and its children together.

## Typed Events

Image and selection `onChange` handlers expose typed `x`, `y`, `width`, and `height` fields. Call `event.preventDefault()` to reject a pending change.

Action events include pointer coordinates, scaling, rotation, and transform centers:

```tsx
import type { CropperActionEvent } from "cropperjs-react-wrapper";

const handleAction = (event: CropperActionEvent) => {
  const { action, scale, centerX, centerY } = event.detail;
  if (action === "scale") {
    console.log({ scale, centerX, centerY });
  }
};

<CropperCanvas onAction={handleAction}>{/* ... */}</CropperCanvas>;
```

The package exports action, action-start, action-move, action-end, image-change, and selection-change event types and their detail types.

## Development

Use the Node.js version in `.node-version` and npm version in `package.json` under `packageManager`, then run `npm ci`.

### Commands

- `npm run dev` / `npm run dev:vite`: Start the Vite demo.
- `npm run dev:nextjs`: Build the library and start the Next.js example.
- `npm run build` / `npm run build:examples`: Build the library alone or with all examples.
- `npm test` / `npm run test:all`: Watch library tests or run all unit tests once.
- `npm run test:browser` / `npm run test:browser:firefox`: Test all apps in Chromium or Firefox. Run `npx playwright install chromium firefox` and `npm run build:examples` first.
- `npm run typecheck`: Typecheck the library and workspaces.
- `npm run lint`: Check formatting and lint rules with Biome.

### Examples

- `example/vite`: Interactive demo.
- `example/react18`: React 18 compatibility fixture.
- `example/nextjs`: Next.js App Router fixture.

## License

MIT
