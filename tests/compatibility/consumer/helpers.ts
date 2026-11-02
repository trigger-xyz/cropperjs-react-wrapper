import { afterEach } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import type { CropperImage } from 'cropperjs';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { act as legacyAct } from 'react-dom/test-utils';

// React.act was added after the minimum supported React 18.2 release.
export const act = React.act ?? legacyAct;
const roots: Array<ReturnType<typeof createRoot>> = [];

export function mountRoot(): ReturnType<typeof createRoot> {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  return root;
}

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});

export function imageState(image: CropperImage, complete = false): void {
  Object.defineProperties(image.$image, {
    complete: { configurable: true, value: complete },
    naturalWidth: { configurable: true, value: 320 },
    naturalHeight: { configurable: true, value: 240 },
  });
}

export async function imageEvent(
  image: CropperImage,
  event: 'load' | 'error',
): Promise<void> {
  await act(async () => {
    image.$image.dispatchEvent(new Event(event));
    // Cropper.js defers $ready resolution to the next timer after load.
    await setTimeout(0);
  });
}
