import type {
  CropperImage as CropperImageElement,
  CropperSelection as CropperSelectionElement,
  CropperShade as CropperShadeElement,
  CropperViewer as CropperViewerElement,
} from 'cropperjs';
import {
  CropperCanvas,
  CropperImage,
  CropperSelection,
  CropperShade,
  CropperViewer,
} from 'cropperjs-react-wrapper';
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
  it('preserves automatic viewer height after removing the explicit resize default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    mountedRoots.push(root);
    const viewerRef = createRef<CropperViewerElement>();
    const selectionRef = createRef<CropperSelectionElement>();
    const tree = (resize?: 'vertical') => (
      <CropperCanvas>
        <CropperSelection
          ref={selectionRef}
          id="react18-resize"
          width={100}
          height={80}
        />
        <CropperViewer
          ref={viewerRef}
          selection="#react18-resize"
          resize={resize}
          style={{ width: 200 }}
        />
      </CropperCanvas>
    );
    await act(async () => root.render(tree('vertical')));
    const viewer = viewerRef.current;
    const selection = selectionRef.current;
    if (!viewer || !selection) throw new Error('Cropper did not mount');
    vi.spyOn(viewer, 'clientWidth', 'get').mockReturnValue(200);

    await act(async () => root.render(tree()));
    expect(viewerRef.current).toBe(viewer);
    expect(viewer.resize).toBe('vertical');
    await act(async () => selection.$change(0, 0, 100, 50));
    expect(viewer.style.height).toBe('100px');
  });

  it('applies and clears Cropper.js 2.3 props without replacing the elements', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    mountedRoots.push(root);
    const imageRef = createRef<CropperImageElement>();
    const selectionRef = createRef<CropperSelectionElement>();
    const shadeRef = createRef<CropperShadeElement>();
    const tree = (enabled: boolean) => (
      <CropperCanvas>
        <CropperImage
          ref={imageRef}
          maxInset={enabled ? '10%' : undefined}
          minInset={enabled ? '-20px' : undefined}
          zoomAroundCenter={enabled}
        />
        <CropperShade ref={shadeRef} />
        <CropperSelection
          ref={selectionRef}
          width={100}
          height={100}
          maxInset={enabled ? '90%' : undefined}
          minInset={enabled ? '0' : undefined}
          borderRadius={enabled ? '50%' : undefined}
          resizeAroundCenter={enabled}
          zoomAroundCenter={enabled}
        />
      </CropperCanvas>
    );
    await act(async () => root.render(tree(true)));
    const image = imageRef.current;
    const selection = selectionRef.current;
    expect(image?.zoomAroundCenter).toBe(true);
    expect(image?.maxInset).toBe('10%');
    expect(image?.minInset).toBe('-20px');
    expect(selection?.resizeAroundCenter).toBe(true);
    expect(selection?.zoomAroundCenter).toBe(true);
    expect(selection?.maxInset).toBe('90%');
    expect(selection?.minInset).toBe('0');
    expect(shadeRef.current?.borderRadius).toBe('50%');

    if (!selection) throw new Error('Selection did not mount');
    selection.minInset = 'auto';
    selection.maxInset = 'auto';
    selection.$change(5, 10, 120, 80);

    await act(async () => root.render(tree(false)));
    expect(imageRef.current).toBe(image);
    expect(selectionRef.current).toBe(selection);
    expect(image?.zoomAroundCenter).toBe(false);
    expect(image?.maxInset).toBe('auto');
    expect(image?.minInset).toBe('auto');
    expect(selection?.resizeAroundCenter).toBe(false);
    expect(selection?.zoomAroundCenter).toBe(false);
    expect(selection?.maxInset).toBe('auto');
    expect(selection?.minInset).toBe('auto');
    expect(selection?.borderRadius).toBe('');
    expect(shadeRef.current?.borderRadius).toBe('');
    expect(selection.x).toBe(5);
    expect(selection.y).toBe(10);
    expect(selection.width).toBe(120);
    expect(selection.height).toBe(80);
  });

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
