import assert from 'node:assert/strict';
import { test } from 'node:test';
import type {
  CropperCanvas as CanvasElement,
  CropperCrosshair as CrosshairElement,
  CropperGrid as GridElement,
  CropperHandle as HandleElement,
  CropperImage as ImageElement,
  CropperSelection as SelectionElement,
  CropperShade as ShadeElement,
  CropperViewer as ViewerElement,
} from 'cropperjs';
import * as candidate from 'cropperjs-react-wrapper';
import * as previous from 'previous-wrapper';
import { createRef, createElement as h, useLayoutEffect, useRef } from 'react';
import { act, imageEvent, imageState, mountRoot } from './helpers.ts';

function ImperativeSource({
  Image,
  assignment,
  onRef,
  onReady,
}: {
  Image: typeof previous.CropperImage;
  assignment: 'callback ref' | 'parent layout effect';
  onRef: (image: ImageElement | null) => void;
  onReady: (image: ImageElement) => void;
}) {
  const element = useRef<ImageElement | null>(null);
  useLayoutEffect(() => {
    if (assignment === 'parent layout effect') {
      assert(element.current);
      element.current.src = 'imperative.png';
    }
  }, [assignment]);
  return h(Image, {
    ref: (value) => {
      element.current = value;
      onRef(value);
      if (value) {
        imageState(value);
        if (assignment === 'callback ref') value.src = 'imperative.png';
      }
    },
    onReady,
  });
}

// Both packages run the same existing-consumer contracts against the same
// locked Cropper.js dependency. Each React version gets an isolated install.
for (const [name, library] of [
  ['baseline 1.2.0', previous],
  ['candidate', candidate],
] as const) {
  const {
    CropperCanvas,
    CropperImage,
    CropperSelection,
    CropperGrid,
    CropperCrosshair,
    CropperHandle,
    CropperShade,
    CropperViewer,
  } = library;

  test(`${name}: all components preserve refs, properties, updates, and native methods`, async () => {
    const canvas = createRef<CanvasElement>();
    const image = createRef<ImageElement>();
    const selection = createRef<SelectionElement>();
    const grid = createRef<GridElement>();
    const crosshair = createRef<CrosshairElement>();
    const handle = createRef<HandleElement>();
    const shade = createRef<ShadeElement>();
    const viewer = createRef<ViewerElement>();
    let changes = 0;
    const tree = (enabled: boolean) =>
      h(
        CropperCanvas,
        { ref: canvas, background: enabled },
        h(CropperImage, {
          ref: image,
          src: 'legacy.png',
          initialCenterSize: enabled ? 'cover' : 'contain',
          rotatable: enabled,
        }),
        h(
          CropperSelection,
          {
            ref: selection,
            id: 'legacy-crop',
            x: 10,
            y: 20,
            width: 100,
            height: 80,
            movable: enabled,
            resizable: true,
            onChange: (event) => {
              assert.equal(typeof event.detail.width, 'number');
              changes++;
            },
          },
          h(CropperGrid, { ref: grid, rows: 4, columns: 5, bordered: enabled }),
          h(CropperCrosshair, { ref: crosshair, centered: enabled }),
          h(CropperHandle, { ref: handle, action: 'move', plain: enabled }),
        ),
        h(CropperShade, { ref: shade, themeColor: 'red' }),
        h(CropperViewer, {
          ref: viewer,
          selection: '#legacy-crop',
          resize: 'both',
        }),
      );
    const root = mountRoot();
    await act(async () => root.render(tree(true)));
    const refs = [
      canvas,
      image,
      selection,
      grid,
      crosshair,
      handle,
      shade,
      viewer,
    ];
    const tags = [
      'canvas',
      'image',
      'selection',
      'grid',
      'crosshair',
      'handle',
      'shade',
      'viewer',
    ];
    refs.forEach((ref, index) => {
      assert.equal(
        ref.current?.tagName.toLowerCase(),
        `cropper-${tags[index]}`,
      );
    });
    assert(canvas.current && image.current && selection.current);
    assert.equal(canvas.current.background, true);
    assert.equal(image.current.initialCenterSize, 'cover');
    assert.equal(image.current.rotatable, true);
    assert.equal(grid.current?.rows, 4);
    assert.equal(grid.current?.columns, 5);
    assert.equal(handle.current?.action, 'move');
    assert.equal(shade.current?.themeColor, 'red');
    assert.equal(viewer.current?.resize, 'both');
    const crop = selection.current;
    assert.deepEqual(
      [crop.x, crop.y, crop.width, crop.height],
      [10, 20, 100, 80],
    );
    changes = 0;
    await act(async () => {
      crop.$change(50, 60, 120, 90);
    });
    assert.deepEqual(
      [crop.x, crop.y, crop.width, crop.height],
      [50, 60, 120, 90],
    );
    assert.equal(changes, 1);
    image.current.$rotate('90deg');
    const matrix = image.current.$getTransform();
    assert(Math.abs(matrix[0]) < 1e-10 && Math.abs(matrix[1] - 1) < 1e-10);
    const originalElements = refs.map((ref) => ref.current);
    await act(async () => root.render(tree(false)));
    refs.forEach((ref, index) => {
      assert.equal(ref.current, originalElements[index]);
    });
    assert.equal(canvas.current.background, false);
    assert.equal(image.current.rotatable, false);
    assert.equal(image.current.initialCenterSize, 'contain');
    assert.equal(selection.current.movable, false);
    assert.equal(grid.current?.bordered, false);
    assert.equal(crosshair.current?.centered, false);
    assert.equal(handle.current?.plain, false);
    await act(async () => root.unmount());
    refs.forEach((ref) => {
      assert.equal(ref.current, null);
    });
  });

  test(`${name}: custom events remain cancelable and use the latest handler`, async () => {
    const image = createRef<ImageElement>();
    const root = mountRoot();
    let first = 0;
    let latest = 0;
    await act(async () =>
      root.render(
        h(CropperImage, {
          ref: image,
          onChange: () => {
            first++;
          },
        }),
      ),
    );
    await act(async () =>
      root.render(
        h(CropperImage, {
          ref: image,
          onChange: (event) => {
            latest++;
            event.preventDefault();
          },
        }),
      ),
    );
    assert(image.current);
    const event = new CustomEvent('change', {
      cancelable: true,
      detail: { x: 1, y: 2, width: 100, height: 80 },
    });
    assert.equal(image.current.dispatchEvent(event), false);
    assert.equal(event.defaultPrevented, true);
    assert.equal(first, 0);
    assert.equal(latest, 1);
  });

  for (const source of ['src', 'srcSet'] as const) {
    test(`${name}: onReady supports ${source} without requiring the other source prop`, async () => {
      const root = mountRoot();
      let image: ImageElement | null = null;
      const ready: ImageElement[] = [];
      await act(async () =>
        root.render(
          h(CropperImage, {
            [source]: source === 'src' ? 'photo.png' : 'photo.png 1x',
            ref: (element) => {
              image = element;
              if (element) imageState(element);
            },
            onReady: (element) => {
              ready.push(element);
            },
          }),
        ),
      );
      assert(image);
      await imageEvent(image, 'load');
      assert.equal(ready.length, 1, 'onReady must run exactly once');
      assert(ready[0] === image, 'onReady must receive the mounted element');
    });
  }

  for (const assignment of ['callback ref', 'parent layout effect'] as const) {
    test(`${name}: onReady supports a source assigned through a ${assignment}`, async () => {
      const ready: ImageElement[] = [];
      let element: ImageElement | null = null;
      const root = mountRoot();
      await act(async () =>
        root.render(
          h(ImperativeSource, {
            Image: CropperImage,
            assignment,
            onRef: (value) => {
              element = value;
            },
            onReady: (value) => {
              ready.push(value);
            },
          }),
        ),
      );
      assert(element);
      await imageEvent(element, 'load');
      assert.equal(ready.length, 1, 'onReady must run exactly once');
      assert(ready[0] === element, 'onReady must receive the mounted element');
    });
  }
}
