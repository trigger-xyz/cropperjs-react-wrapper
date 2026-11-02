import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CropperImage as ImageElement } from 'cropperjs';
import { CropperImage } from 'cropperjs-react-wrapper';
import { createElement as h, StrictMode } from 'react';
import { act, imageEvent, imageState, mountRoot } from './helpers.ts';

test('candidate: an already loaded image calls onReady once in Strict Mode', async () => {
  let image: ImageElement | null = null;
  const ready: ImageElement[] = [];
  const root = mountRoot();
  await act(async () =>
    root.render(
      h(
        StrictMode,
        null,
        h(CropperImage, {
          src: 'cached.png',
          ref: (element) => {
            image = element;
            if (element) imageState(element, true);
          },
          onReady: (element) => {
            ready.push(element);
          },
        }),
      ),
    ),
  );
  assert(image);
  assert.equal(ready.length, 1, 'onReady must run exactly once');
  assert(ready[0] === image, 'onReady must receive the mounted element');
});

for (const source of ['src', 'srcSet'] as const) {
  test(`candidate: ${source} supplied after mount and replaced before load calls onReady once`, async () => {
    let image: ImageElement | null = null;
    const ready: ImageElement[] = [];
    const root = mountRoot();
    const ref = (element: ImageElement | null) => {
      image = element;
      if (element) imageState(element);
    };
    const onReady = (element: ImageElement) => {
      ready.push(element);
    };
    await act(async () => root.render(h(CropperImage, { ref, onReady })));
    const original = image;
    const tree = (value: string) =>
      h(CropperImage, { ref, onReady, [source]: value });
    await act(async () =>
      root.render(tree(source === 'src' ? 'first.png' : 'first.png 1x')),
    );
    await act(async () =>
      root.render(tree(source === 'src' ? 'second.png' : 'second.png 1x')),
    );
    assert(image);
    assert.equal(image, original);
    await imageEvent(image, 'load');
    assert.equal(ready.length, 1, 'onReady must run exactly once');
    assert(ready[0] === image, 'onReady must receive the mounted element');
  });
}

test('candidate: the latest callback receives readiness without replay on callback-only changes', async () => {
  let image: ImageElement | null = null;
  const calls: string[] = [];
  const root = mountRoot();
  const ref = (element: ImageElement | null) => {
    image = element;
    if (element) imageState(element);
  };
  const tree = (name: string) =>
    h(CropperImage, {
      ref,
      src: 'pending.png',
      onReady: () => {
        calls.push(name);
      },
    });
  await act(async () => root.render(tree('first')));
  await act(async () => root.render(tree('latest')));
  assert(image);
  await imageEvent(image, 'load');
  assert.deepEqual(calls, ['latest']);
  imageState(image, true);
  await act(async () => root.render(tree('replacement')));
  assert.deepEqual(calls, ['latest']);
});

test('candidate: failed loading can recover with a new source', async () => {
  let image: ImageElement | null = null;
  let calls = 0;
  const root = mountRoot();
  const ref = (element: ImageElement | null) => {
    image = element;
    if (element) imageState(element);
  };
  const onReady = () => {
    calls++;
  };
  await act(async () =>
    root.render(h(CropperImage, { ref, src: 'bad.png', onReady })),
  );
  assert(image);
  await imageEvent(image, 'error');
  assert.equal(calls, 0);
  await act(async () =>
    root.render(h(CropperImage, { ref, src: 'good.png', onReady })),
  );
  assert(image);
  await imageEvent(image, 'load');
  assert.equal(calls, 1);
});

test('candidate: unmount cancels pending readiness', async () => {
  let image: ImageElement | null = null;
  let calls = 0;
  const root = mountRoot();
  await act(async () =>
    root.render(
      h(CropperImage, {
        src: 'pending.png',
        ref: (element) => {
          image = element;
          if (element) imageState(element);
        },
        onReady: () => {
          calls++;
        },
      }),
    ),
  );
  assert(image);
  const detached = image;
  await act(async () => root.unmount());
  await imageEvent(detached, 'load');
  assert.equal(calls, 0);
});
