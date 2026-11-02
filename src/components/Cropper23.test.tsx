import { act, render, waitFor } from '@testing-library/react';
import type {
  CropperImage as CropperImageElement,
  CropperSelection as CropperSelectionElement,
  CropperShade as CropperShadeElement,
  CropperViewer as CropperViewerElement,
} from 'cropperjs';
import { createRef, type ReactNode, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { describe, expect, it, vi } from 'vitest';
import { CropperCanvas } from './CropperCanvas';
import { CropperImage } from './CropperImage';
import { CropperSelection } from './CropperSelection';
import { CropperShade } from './CropperShade';
import { CropperViewer } from './CropperViewer';

function AttachedPortal({
  container,
  children,
}: {
  container: HTMLElement;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    document.body.appendChild(container);
    return () => container.remove();
  }, [container]);
  return createPortal(children, container);
}

describe('Cropper.js 2.3', () => {
  it('lets a viewer clone the image transformation capabilities on connection', () => {
    const viewerRef = createRef<CropperViewerElement>();
    render(
      <>
        <CropperCanvas>
          <CropperImage
            src="pending.png"
            rotatable
            scalable
            skewable
            translatable
          />
          <CropperSelection id="transform-preview" width={100} height={80} />
        </CropperCanvas>
        <CropperViewer ref={viewerRef} selection="#transform-preview" />
      </>,
    );
    const previewImage =
      viewerRef.current?.shadowRoot?.querySelector<CropperImageElement>(
        'cropper-image',
      );
    expect(previewImage?.rotatable).toBe(true);
    expect(previewImage?.scalable).toBe(true);
    expect(previewImage?.skewable).toBe(true);
    expect(previewImage?.translatable).toBe(true);
  });

  it('positions the viewer preview when the source image is not interactive', async () => {
    const imageRef = createRef<CropperImageElement>();
    const viewerRef = createRef<CropperViewerElement>();
    render(
      <CropperCanvas>
        <CropperImage ref={imageRef} src="cached.png" />
        <CropperSelection
          id="static-image-preview"
          x={10}
          y={20}
          width={100}
          height={80}
        />
        <CropperViewer
          ref={viewerRef}
          selection="#static-image-preview"
          resize="both"
        />
      </CropperCanvas>,
    );
    const image = imageRef.current;
    const preview =
      viewerRef.current?.shadowRoot?.querySelector<CropperImageElement>(
        'cropper-image',
      );
    if (!image || !preview) throw new Error('Preview did not mount');
    Object.defineProperties(image.$image, {
      complete: { configurable: true, value: true },
      naturalWidth: { configurable: true, value: 320 },
      naturalHeight: { configurable: true, value: 240 },
    });
    await waitFor(() =>
      expect(preview.$getTransform()).toEqual([1, 0, 0, 1, -10, -20]),
    );
    expect(image.rotatable).toBe(false);
    expect(image.scalable).toBe(false);
    expect(image.skewable).toBe(false);
    expect(image.translatable).toBe(false);
  });

  it('initializes a viewer in a portal attached by its parent layout effect', async () => {
    const portalContainer = document.createElement('div');
    const viewerRef = createRef<CropperViewerElement>();
    const imageRef = createRef<CropperImageElement>();
    const { unmount } = render(
      <AttachedPortal container={portalContainer}>
        <CropperCanvas>
          <CropperImage ref={imageRef} src="cached.png" />
          <CropperSelection
            id="portal-crop"
            x={10}
            y={20}
            width={100}
            height={80}
          />
          <CropperViewer
            ref={viewerRef}
            selection="#portal-crop"
            resize="both"
          />
        </CropperCanvas>
      </AttachedPortal>,
    );
    const image = imageRef.current;
    const preview =
      viewerRef.current?.shadowRoot?.querySelector<CropperImageElement>(
        'cropper-image',
      );
    if (!image || !preview) throw new Error('Portal preview did not mount');
    Object.defineProperties(image.$image, {
      complete: { configurable: true, value: true },
      naturalWidth: { configurable: true, value: 320 },
      naturalHeight: { configurable: true, value: 240 },
    });
    await waitFor(() =>
      expect(preview.$getTransform()).toEqual([1, 0, 0, 1, -10, -20]),
    );
    unmount();
    expect(portalContainer.isConnected).toBe(false);
  });

  it('does not reset an edited crop when the new selection controls change', () => {
    const ref = createRef<CropperSelectionElement>();
    const { rerender } = render(
      <CropperSelection
        ref={ref}
        x={10}
        y={20}
        width={100}
        height={80}
        resizable
        movable
      />,
    );
    const selection = ref.current;
    if (!selection) throw new Error('Selection did not mount');
    selection.$change(40, 50, 120, 90);
    rerender(
      <CropperSelection
        ref={ref}
        x={10}
        y={20}
        width={100}
        height={80}
        resizable
        movable
        borderRadius="50%"
        resizeAroundCenter
        zoomAroundCenter
        minInset="0"
      />,
    );
    expect(selection.x).toBe(40);
    expect(selection.y).toBe(50);
    expect(selection.width).toBe(120);
    expect(selection.height).toBe(90);
  });

  it('sizes an already loaded image on connection', async () => {
    const complete = vi
      .spyOn(HTMLImageElement.prototype, 'complete', 'get')
      .mockReturnValue(true);
    const width = vi
      .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
      .mockReturnValue(320);
    const height = vi
      .spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get')
      .mockReturnValue(240);
    try {
      const ref = createRef<CropperImageElement>();
      const onReady = vi.fn();
      render(<CropperImage ref={ref} src="cached.png" onReady={onReady} />);
      expect(ref.current?.style.width).toBe('320px');
      expect(ref.current?.style.height).toBe('240px');
      await waitFor(() => expect(onReady).toHaveBeenCalledWith(ref.current));
    } finally {
      complete.mockRestore();
      width.mockRestore();
      height.mockRestore();
    }
  });

  it('repositions a non-resizable selection without changing its dimensions', () => {
    const ref = createRef<CropperSelectionElement>();
    const { container } = render(
      <CropperCanvas>
        <CropperSelection ref={ref} width={100} height={80} resizable={false} />
      </CropperCanvas>,
    );
    const canvas = container.querySelector('cropper-canvas') as HTMLElement;
    const relatedEvent = new MouseEvent('pointerdown', {
      clientX: 50,
      clientY: 60,
    });
    canvas.dispatchEvent(
      new CustomEvent('actionstart', {
        detail: { action: 'select', relatedEvent },
      }),
    );
    canvas.dispatchEvent(
      new CustomEvent('action', {
        detail: {
          action: 'select',
          relatedEvent,
          startX: 50,
          startY: 60,
          endX: 90,
          endY: 100,
        },
      }),
    );
    expect(ref.current?.x).toBe(50);
    expect(ref.current?.y).toBe(60);
    expect(ref.current?.width).toBe(100);
    expect(ref.current?.height).toBe(80);
  });

  it('updates and removes image inset and center props on the same element', () => {
    const ref = createRef<CropperImageElement>();
    const { rerender } = render(
      <CropperImage
        ref={ref}
        maxInset="10% 20px"
        minInset="-10px"
        zoomAroundCenter
      />,
    );
    const image = ref.current;
    expect(image?.maxInset).toBe('10% 20px');
    expect(image?.minInset).toBe('-10px');
    expect(image?.zoomAroundCenter).toBe(true);
    expect(image).toHaveAttribute('zoom-around-center');

    rerender(
      <CropperImage
        ref={ref}
        maxInset="calc(50% - 10px)"
        minInset="0"
        zoomAroundCenter={false}
      />,
    );
    expect(ref.current).toBe(image);
    expect(image?.maxInset).toBe('calc(50% - 10px)');
    expect(image?.minInset).toBe('0');
    expect(image?.zoomAroundCenter).toBe(false);
    expect(image).not.toHaveAttribute('zoom-around-center');

    rerender(<CropperImage ref={ref} />);
    expect(image?.maxInset).toBe('auto');
    expect(image?.minInset).toBe('auto');
    expect(image?.zoomAroundCenter).toBe(false);
  });

  it('updates and removes selection limits, radius, and center props', async () => {
    const ref = createRef<CropperSelectionElement>();
    const { rerender } = render(
      <CropperSelection
        ref={ref}
        maxInset="80%"
        minInset="10px"
        borderRadius="50%"
        resizeAroundCenter
        zoomAroundCenter
      />,
    );
    const selection = ref.current;
    expect(selection?.maxInset).toBe('80%');
    expect(selection?.minInset).toBe('10px');
    expect(selection?.borderRadius).toBe('50%');
    expect(selection?.resizeAroundCenter).toBe(true);
    expect(selection?.zoomAroundCenter).toBe(true);
    await waitFor(() => expect(selection?.style.borderRadius).toBe('50%'));

    rerender(
      <CropperSelection
        ref={ref}
        maxInset="90%"
        minInset="0"
        borderRadius="12px"
        resizeAroundCenter={false}
        zoomAroundCenter={false}
      />,
    );
    expect(ref.current).toBe(selection);
    expect(selection?.maxInset).toBe('90%');
    expect(selection?.minInset).toBe('0');
    expect(selection?.borderRadius).toBe('12px');
    expect(selection?.resizeAroundCenter).toBe(false);
    expect(selection?.zoomAroundCenter).toBe(false);

    rerender(<CropperSelection ref={ref} />);
    expect(selection?.maxInset).toBe('auto');
    expect(selection?.minInset).toBe('auto');
    expect(selection?.borderRadius).toBe('');
    expect(selection).not.toHaveAttribute('resize-around-center');
    expect(selection).not.toHaveAttribute('zoom-around-center');
    await waitFor(() => expect(selection?.style.borderRadius).toBe(''));
  });

  it('supports an explicit shade radius and automatic selection synchronization', async () => {
    const ref = createRef<CropperShadeElement>();
    const { rerender, unmount } = render(
      <CropperShade ref={ref} borderRadius="16px" />,
    );
    await waitFor(() => expect(ref.current?.style.borderRadius).toBe('16px'));
    rerender(<CropperShade ref={ref} borderRadius="" />);
    await waitFor(() => expect(ref.current?.style.borderRadius).toBe(''));
    unmount();

    const cropper = (radius: string) => (
      <CropperCanvas>
        <CropperShade ref={ref} />
        <CropperSelection width={100} height={80} borderRadius={radius} />
      </CropperCanvas>
    );
    const view = render(cropper('50%'));
    await waitFor(() => expect(ref.current?.borderRadius).toBe('50%'));
    view.rerender(cropper('10px 20px'));
    await waitFor(() =>
      expect(ref.current?.style.borderRadius).toBe('10px 20px'),
    );
  });

  it('enforces selection insets and allows clearing the selection', () => {
    const ref = createRef<CropperSelectionElement>();
    const { container } = render(
      <CropperCanvas>
        <CropperSelection ref={ref} minInset="0" maxInset="auto" movable />
      </CropperCanvas>,
    );
    const canvas = container.querySelector('cropper-canvas');
    vi.spyOn(canvas as HTMLElement, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 0, 300, 200),
    );
    const selection = ref.current as CropperSelectionElement;
    selection.$change(20, 20, 100, 80);
    selection.$moveTo(-1, 20);
    expect(selection.x).toBe(20);
    selection.$moveTo(40, 30);
    expect(selection.x).toBe(40);
    expect(selection.y).toBe(30);
    selection.$clear();
    expect(selection.width).toBe(0);
    expect(selection.height).toBe(0);
  });

  it('keeps the center fixed during repeated resizing and zooming', () => {
    const ref = createRef<CropperSelectionElement>();
    render(
      <CropperSelection
        ref={ref}
        x={10}
        y={20}
        width={100}
        height={50}
        resizable
        zoomable
        resizeAroundCenter
        zoomAroundCenter
      />,
    );
    const selection = ref.current as CropperSelectionElement;
    for (let i = 0; i < 10; i += 1) {
      selection.$resize('e-resize', 1, 0);
      selection.$zoom(0.01);
      expect(selection.x + selection.width / 2).toBe(60);
      expect(selection.y + selection.height / 2).toBe(45);
    }
  });

  it('sizes an image when src is supplied after connection', async () => {
    const ref = createRef<CropperImageElement>();
    const onReady = vi.fn();
    const { rerender } = render(<CropperImage ref={ref} onReady={onReady} />);
    const image = ref.current as CropperImageElement;
    expect(image.style.width).toBe('');
    rerender(
      <CropperImage ref={ref} src="loaded-later.png" onReady={onReady} />,
    );
    Object.defineProperties(image.$image, {
      naturalWidth: { configurable: true, value: 320 },
      naturalHeight: { configurable: true, value: 240 },
    });
    await act(async () => image.$image.dispatchEvent(new Event('load')));
    expect(ref.current).toBe(image);
    expect(image.style.width).toBe('320px');
    expect(image.style.height).toBe('240px');
    await waitFor(() => expect(onReady).toHaveBeenCalledWith(image));
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('calls onReady when the source is supplied through a ref', async () => {
    const onReady = vi.fn();
    const { container } = render(
      <CropperImage
        ref={(image) => {
          if (!image) return;
          image.src = 'imperative-source.png';
          Object.defineProperties(image.$image, {
            complete: { configurable: true, value: false },
            naturalWidth: { configurable: true, value: 320 },
            naturalHeight: { configurable: true, value: 240 },
          });
        }}
        onReady={onReady}
      />,
    );
    const image = container.querySelector<CropperImageElement>('cropper-image');
    if (!image) throw new Error('Image did not mount');
    await act(async () => image.$image.dispatchEvent(new Event('load')));
    await waitFor(() => expect(onReady).toHaveBeenCalledWith(image));
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('does not call onReady after unmount or a failed source', async () => {
    const ref = createRef<CropperImageElement>();
    const onReady = vi.fn();
    const { rerender, unmount } = render(
      <CropperImage ref={ref} src="bad.png" onReady={onReady} />,
    );
    const image = ref.current as CropperImageElement;
    await act(async () => image.$image.dispatchEvent(new Event('error')));
    expect(onReady).not.toHaveBeenCalled();
    rerender(<CropperImage ref={ref} src="pending.png" onReady={onReady} />);
    unmount();
    await act(async () => {
      image.$image.dispatchEvent(new Event('load'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(onReady).not.toHaveBeenCalled();
  });

  it('uses the latest onReady callback without replaying readiness on rerenders', async () => {
    const ref = createRef<CropperImageElement>();
    const first = vi.fn();
    const latest = vi.fn();
    const replacement = vi.fn();
    const { rerender } = render(
      <CropperImage ref={ref} src="pending.png" onReady={first} />,
    );
    const image = ref.current;
    if (!image) throw new Error('Image did not mount');
    rerender(<CropperImage ref={ref} src="pending.png" onReady={latest} />);
    Object.defineProperties(image.$image, {
      complete: { configurable: true, value: true },
      naturalWidth: { configurable: true, value: 320 },
      naturalHeight: { configurable: true, value: 240 },
    });
    await act(async () => image.$image.dispatchEvent(new Event('load')));
    await waitFor(() => expect(latest).toHaveBeenCalledTimes(1));
    expect(first).not.toHaveBeenCalled();
    await act(async () =>
      rerender(
        <CropperImage ref={ref} src="pending.png" onReady={replacement} />,
      ),
    );
    expect(replacement).not.toHaveBeenCalled();
  });

  it('connects the viewer to its selection before rendering its rounded preview', async () => {
    const ref = createRef<CropperViewerElement>();
    const selectionRef = createRef<CropperSelectionElement>();
    const tree = (radius: string) => (
      <>
        <CropperCanvas>
          <CropperSelection
            ref={selectionRef}
            id="rounded-preview"
            width={100}
            height={80}
            borderRadius={radius}
          />
        </CropperCanvas>
        <CropperViewer ref={ref} selection="#rounded-preview" resize="both" />
      </>
    );
    const { rerender } = render(tree('12px'));
    expect(ref.current?.$selection).toBe(selectionRef.current);
    await waitFor(() => expect(ref.current?.style.borderRadius).toBe('12px'));
    rerender(tree('50%'));
    await waitFor(() => expect(ref.current?.style.borderRadius).toBe('50%'));
  });

  it('reconnects the viewer and its ref when selection or resize changes', async () => {
    const ref = createRef<CropperViewerElement>();
    const first = createRef<CropperSelectionElement>();
    const second = createRef<CropperSelectionElement>();
    const tree = (selection: string, resize: 'both' | 'none') => (
      <>
        <CropperCanvas>
          <CropperSelection
            ref={first}
            id="first-preview"
            multiple
            width={100}
            height={80}
            borderRadius="12px"
          />
          <CropperSelection
            ref={second}
            id="second-preview"
            multiple
            width={60}
            height={40}
            borderRadius="50%"
          />
        </CropperCanvas>
        <CropperViewer
          ref={ref}
          selection={selection}
          resize={resize}
          style={{ width: 200, height: 200 }}
        />
      </>
    );
    const { rerender, unmount } = render(tree('#first-preview', 'both'));
    const originalViewer = ref.current;
    expect(originalViewer?.$selection).toBe(first.current);
    await waitFor(() => expect(originalViewer?.style.width).toBe('100px'));
    rerender(tree('#second-preview', 'both'));
    expect(originalViewer?.isConnected).toBe(false);
    expect(ref.current?.$selection).toBe(second.current);
    await waitFor(() => expect(ref.current?.style.width).toBe('60px'));
    rerender(tree('#second-preview', 'none'));
    expect(ref.current?.$selection).toBe(second.current);
    expect(ref.current?.style.width).toBe('200px');
    expect(ref.current?.style.height).toBe('200px');
    unmount();
    expect(ref.current).toBe(null);
  });

  it('keeps the default viewer resize mode when the explicit prop is removed', async () => {
    const viewerRef = createRef<CropperViewerElement>();
    const selectionRef = createRef<CropperSelectionElement>();
    const tree = (resize?: 'vertical') => (
      <CropperCanvas>
        <CropperSelection
          ref={selectionRef}
          id="default-resize"
          width={100}
          height={80}
        />
        <CropperViewer
          ref={viewerRef}
          selection="#default-resize"
          resize={resize}
          style={{ width: 200 }}
        />
      </CropperCanvas>
    );
    const { rerender } = render(tree('vertical'));
    const viewer = viewerRef.current;
    const selection = selectionRef.current;
    if (!viewer || !selection) throw new Error('Cropper did not mount');
    vi.spyOn(viewer, 'clientWidth', 'get').mockReturnValue(200);
    await act(async () => selection.$change(0, 0, 100, 90));
    expect(viewer.style.height).toBe('180px');

    rerender(tree());
    expect(viewerRef.current).toBe(viewer);
    expect(viewer.resize).toBe('vertical');
    await act(async () => selection.$change(0, 0, 100, 50));
    expect(viewer.style.height).toBe('100px');
  });

  it.each(['handler', 'bounded'] as const)(
    'keeps the viewer and shade on the accepted crop when %s rejects a change',
    async (cancelWith) => {
      const viewerRef = createRef<CropperViewerElement>();
      const selectionRef = createRef<CropperSelectionElement>();
      const imageRef = createRef<CropperImageElement>();
      const shadeRef = createRef<CropperShadeElement>();
      const { container } = render(
        <CropperCanvas>
          <CropperImage ref={imageRef} src="pending.png" scalable />
          <CropperShade ref={shadeRef} />
          <CropperSelection
            ref={selectionRef}
            id="cancelled-crop"
            width={100}
            height={80}
            bounded={cancelWith === 'bounded'}
            onChange={(event) => {
              if (cancelWith === 'handler' && event.detail.width > 300) {
                event.preventDefault();
              }
            }}
          />
          <CropperViewer
            ref={viewerRef}
            selection="#cancelled-crop"
            resize="both"
          />
        </CropperCanvas>,
      );
      const canvas = container.querySelector('cropper-canvas');
      const image = imageRef.current;
      const selection = selectionRef.current;
      if (!canvas || !image || !selection)
        throw new Error('Cropper did not mount');
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(
        new DOMRect(0, 0, 300, 200),
      );
      vi.spyOn(image, 'getBoundingClientRect').mockReturnValue(
        new DOMRect(0, 0, 300, 200),
      );
      await act(async () => selection.$change(10, 10, 100, 80));

      await act(async () => selection.$change(20, 20, 400, 300));
      expect(selection.width).toBe(100);
      expect(selection.height).toBe(80);
      expect(viewerRef.current?.style.width).toBe('100px');
      expect(viewerRef.current?.style.height).toBe('80px');
      expect(shadeRef.current?.width).toBe(100);
      expect(shadeRef.current?.height).toBe(80);
    },
  );

  it('initializes coverage from the loaded image and preserves explicit dimensions', async () => {
    const imageRef = createRef<CropperImageElement>();
    const selectionRef = createRef<CropperSelectionElement>();
    const { container } = render(
      <CropperCanvas>
        <CropperImage ref={imageRef} src="pending.png" />
        <CropperSelection
          ref={selectionRef}
          width={100}
          height={80}
          initialCoverage={0.5}
        />
      </CropperCanvas>,
    );
    const image = imageRef.current as CropperImageElement;
    const selection = selectionRef.current as CropperSelectionElement;
    vi.spyOn(
      container.querySelector('cropper-canvas') as HTMLElement,
      'getBoundingClientRect',
    ).mockReturnValue(new DOMRect(0, 0, 600, 400));
    vi.spyOn(image, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(100, 50, 400, 300),
    );
    Object.defineProperties(image.$image, {
      naturalWidth: { configurable: true, value: 400 },
      naturalHeight: { configurable: true, value: 300 },
    });
    await act(async () => image.$image.dispatchEvent(new Event('load')));
    await waitFor(() => {
      expect(selection.width).toBe(100);
      expect(selection.height).toBe(80);
      expect(selection.x).toBe(250);
      expect(selection.y).toBe(160);
    });
  });
});
