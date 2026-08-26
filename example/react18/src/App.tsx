import type {
  CropperImage as CropperImageElement,
  CropperSelection as CropperSelectionElement,
} from 'cropperjs';
import {
  CropperCanvas,
  CropperCrosshair,
  CropperGrid,
  CropperHandle,
  CropperImage,
  CropperSelection,
} from 'cropperjs-react-wrapper';
import { useRef, useState } from 'react';

const imageUrl = 'https://fengyuanchen.github.io/cropperjs/images/picture.jpg';

export function App() {
  const imageRef = useRef<CropperImageElement>(null);
  const selectionRef = useRef<CropperSelectionElement>(null);
  const [changeCount, setChangeCount] = useState(0);

  return (
    <main
      style={{ margin: '2rem auto', maxWidth: 720, fontFamily: 'sans-serif' }}
    >
      <h1>React 18 compatibility</h1>
      <CropperCanvas background style={{ height: 420 }}>
        <CropperImage
          ref={imageRef}
          src={imageUrl}
          alt="Cropper.js sample"
          initialFit="contain"
          minFit="contain"
          maxFit="none"
          rotatable
          scalable
          skewable
          translatable
          onChange={() => setChangeCount((count) => count + 1)}
        />
        <CropperSelection
          ref={selectionRef}
          initialCoverage={0.5}
          movable
          resizable
          zoomable
        >
          <CropperGrid role="grid" bordered covered />
          <CropperCrosshair centered />
          <CropperHandle action="move" themeColor="rgba(255, 255, 255, 0.35)" />
          <CropperHandle action="n-resize" />
          <CropperHandle action="e-resize" />
          <CropperHandle action="s-resize" />
          <CropperHandle action="w-resize" />
        </CropperSelection>
      </CropperCanvas>
      <p>Image changes observed: {changeCount}</p>
      <button type="button" onClick={() => imageRef.current?.$rotate('90deg')}>
        Rotate image
      </button>
      <button
        type="button"
        onClick={() => selectionRef.current?.$reset()}
        style={{ marginLeft: '0.5rem' }}
      >
        Reset selection
      </button>
    </main>
  );
}
