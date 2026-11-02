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
  CropperShade,
  CropperViewer,
} from 'cropperjs-react-wrapper';
import { useCallback, useRef, useState } from 'react';

import imageUrl from '../../vite/assets/image1.png';

export function App() {
  const imageRef = useRef<CropperImageElement>(null);
  const selectionRef = useRef<CropperSelectionElement>(null);
  const [changeCount, setChangeCount] = useState(0);
  const [src, setSrc] = useState<string>();
  const [centered, setCentered] = useState(true);
  const [readyCount, setReadyCount] = useState(0);
  const handleReady = useCallback(
    () => setReadyCount((count) => count + 1),
    [],
  );

  return (
    <main
      style={{ margin: '2rem auto', maxWidth: 720, fontFamily: 'sans-serif' }}
    >
      <h1>React 18 compatibility</h1>
      <CropperCanvas background style={{ height: 420 }}>
        <CropperImage
          ref={imageRef}
          src={src}
          alt="Cropper.js sample"
          initialFit="contain"
          minFit="contain"
          maxFit="none"
          minInset="auto"
          maxInset="auto"
          zoomAroundCenter={centered}
          rotatable
          scalable
          skewable
          translatable
          onChange={() => setChangeCount((count) => count + 1)}
          onReady={handleReady}
        />
        <CropperShade />
        <CropperSelection
          id="react18-selection"
          ref={selectionRef}
          initialCoverage={src ? 0.5 : undefined}
          movable
          resizable
          zoomable
          minInset="0"
          maxInset="auto"
          borderRadius="50%"
          resizeAroundCenter={centered}
          zoomAroundCenter={centered}
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
      {readyCount > 0 && (
        <CropperViewer selection="#react18-selection" style={{ width: 160 }} />
      )}
      <button type="button" onClick={() => setSrc(imageUrl)}>
        Load image
      </button>
      <label>
        <input
          type="checkbox"
          checked={centered}
          onChange={(event) => setCentered(event.target.checked)}
        />
        Resize and zoom around center
      </label>
      <p>Image changes observed: {changeCount}</p>
      <p>Image ready: {readyCount}</p>
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
