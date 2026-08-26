import type { CropperImage as CropperImageElement } from 'cropperjs';
import { CropperCanvas, CropperImage } from 'cropperjs-react-wrapper';
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const mountedRoots: Array<ReturnType<typeof createRoot>> = [];

afterEach(() => {
  for (const root of mountedRoots.splice(0)) {
    act(() => root.unmount());
  }
  document.body.innerHTML = '';
});

describe('React 18 compatibility', () => {
  it('supports refs, properties, and cancelable custom events', () => {
    const container = document.createElement('div');
    const imageRef = createRef<CropperImageElement>();
    const onChange = vi.fn((event: CustomEvent) => event.preventDefault());
    document.body.appendChild(container);

    const root = createRoot(container);
    mountedRoots.push(root);
    act(() => {
      root.render(
        <CropperCanvas background slottable={false}>
          <CropperImage
            ref={imageRef}
            src="test.jpg"
            decoding="async"
            initialFit="cover"
            loading="lazy"
            onChange={onChange}
            slottable
            srcSet="test.jpg 1x"
          />
        </CropperCanvas>,
      );
    });

    const image = container.querySelector('cropper-image');
    expect(imageRef.current).toBe(image);
    expect(imageRef.current?.decoding).toBe('async');
    expect(imageRef.current?.initialFit).toBe('cover');
    expect(imageRef.current?.loading).toBe('lazy');
    expect(imageRef.current?.slottable).toBe(true);
    expect(imageRef.current?.srcset).toBe('test.jpg 1x');

    const event = new CustomEvent('change', {
      cancelable: true,
      detail: { x: 0, y: 0, width: 100, height: 100 },
    });
    act(() => {
      image?.dispatchEvent(event);
    });

    expect(onChange).toHaveBeenCalledWith(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
