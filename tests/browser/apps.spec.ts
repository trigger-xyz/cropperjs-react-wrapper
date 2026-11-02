import { readFile } from 'node:fs/promises';
import type { Locator, Page } from '@playwright/test';
import type { CropperImage, CropperSelection } from 'cropperjs';
import { expect, test } from './fixtures';

async function openApp(
  page: Page,
  project: string,
): Promise<{
  errors: string[];
  image: Locator;
  selection: Locator;
}> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  const image = page.locator('cropper-canvas > cropper-image');
  await expect(image).toBeAttached();
  if (project === 'vite-react18') {
    // Exercise 2.3.1's fix for setting src after the element connects.
    await expect(image).not.toHaveAttribute('src');
    await page.getByRole('button', { name: 'Load image', exact: true }).click();
    await expect(
      page.getByText('Image ready: 1', { exact: true }),
    ).toBeVisible();
  }
  await expect
    .poll(() =>
      image.evaluate((element) => {
        const image = element as CropperImage;
        return (
          image.$image.complete &&
          image.$image.naturalWidth > 0 &&
          image.getBoundingClientRect().width > 0
        );
      }),
    )
    .toBe(true);

  const selection = page.locator('cropper-selection');
  if (project === 'vite-react19') {
    const bounds = await image.boundingBox();
    if (!bounds) throw new Error('Image has no bounds');
    await page.mouse.move(
      bounds.x + bounds.width * 0.3,
      bounds.y + bounds.height * 0.3,
    );
    await page.mouse.down();
    await page.mouse.move(
      bounds.x + bounds.width * 0.7,
      bounds.y + bounds.height * 0.7,
      { steps: 10 },
    );
    await page.mouse.up();
    await page.getByLabel('Show Shade', { exact: true }).check();
    await page.getByRole('button', { name: 'Behavior', exact: true }).click();
    await page.getByLabel('Border radius:', { exact: true }).fill('50%');
    await page
      .getByLabel('Selection minimum inset:', { exact: true })
      .fill('0');
    await page
      .getByLabel('Resize selection around center', { exact: true })
      .check();
    await page
      .getByLabel('Zoom selection around center', { exact: true })
      .check();
  }
  await expect
    .poll(() =>
      selection.evaluate((element) => (element as CropperSelection).width),
    )
    .toBeGreaterThan(0);
  return { errors, image, selection };
}

test('loads, crops with rounded corners, and synchronizes the shade and viewer', async ({
  page,
}, testInfo) => {
  const { errors, image, selection } = await openApp(
    page,
    testInfo.project.name,
  );
  const radius = await selection.evaluate(
    (element) => (element as CropperSelection).borderRadius,
  );
  await expect(page.locator('cropper-shade')).toHaveJSProperty(
    'borderRadius',
    radius,
  );
  if (testInfo.project.name !== 'vite-react19') {
    await expect
      .poll(() =>
        page
          .locator('cropper-viewer')
          .evaluate((element) => element.style.borderRadius),
      )
      .not.toBe('');
    const previewMatchesCrop = () =>
      page.locator('cropper-viewer').evaluate((element) => {
        const viewer = element as import('cropperjs').CropperViewer;
        const selection = viewer.$selection;
        const source = selection
          .closest('cropper-canvas')
          ?.querySelector<CropperImage>('cropper-image');
        const preview =
          viewer.shadowRoot?.querySelector<CropperImage>('cropper-image');
        if (!source || !preview || !selection.width) return false;
        const [a, b, c, d, e, f] = source.$getTransform();
        const scale = viewer.clientWidth / selection.width;
        const expected = [
          a,
          b,
          c,
          d,
          (e - selection.x) * scale,
          (f - selection.y) * scale,
        ];
        return preview
          .$getTransform()
          .every((value, index) => Math.abs(value - expected[index]) < 0.001);
      });
    await expect.poll(previewMatchesCrop).toBe(true);
    await selection.evaluate((element) =>
      (element as CropperSelection).$move(5, 5),
    );
    await image.evaluate((element) => (element as CropperImage).$move(5, 0));
    await expect.poll(previewMatchesCrop).toBe(true);
  }
  const pixels = await selection.evaluate(async (element) => {
    const selection = element as CropperSelection;
    const canvas = await selection.$toCanvas({ width: 160 });
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No canvas context');
    return {
      width: canvas.width,
      height: canvas.height,
      cornerAlpha: context.getImageData(0, 0, 1, 1).data[3],
      centerAlpha: context.getImageData(
        Math.floor(canvas.width / 2),
        Math.floor(canvas.height / 2),
        1,
        1,
      ).data[3],
    };
  });
  expect(pixels.width).toBe(160);
  expect(pixels.height).toBeGreaterThan(0);
  expect(pixels.cornerAlpha).toBe(0);
  expect(pixels.centerAlpha).toBe(255);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath('app.png'),
    fullPage: true,
  });
});

test('preserves the selection center and rejects moves outside the canvas', async ({
  page,
}, testInfo) => {
  const { errors, selection } = await openApp(page, testInfo.project.name);
  const result = await selection.evaluate((element) => {
    const selection = element as CropperSelection;
    const center = () => [
      selection.x + selection.width / 2,
      selection.y + selection.height / 2,
    ];
    const before = center();
    const width = selection.width;
    selection.$resize('e-resize', 10, 0);
    const resized = center();
    const resizedWidth = selection.width;
    selection.$zoom(0.1);
    const zoomed = center();
    const x = selection.x;
    selection.$moveTo(-10, selection.y);
    return {
      before,
      resized,
      zoomed,
      width,
      resizedWidth,
      x,
      rejectedX: selection.x,
    };
  });
  expect(result.resizedWidth).toBeGreaterThan(result.width);
  expect(result.resized).toEqual(result.before);
  expect(result.zoomed).toEqual(result.before);
  expect(result.rejectedX).toBe(result.x);
  expect(errors).toEqual([]);
});

test('keeps exports attached to the current image after fit and source changes', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'vite-react19',
    'Interactive Vite demo controls',
  );
  const { errors, image, selection } = await openApp(
    page,
    testInfo.project.name,
  );
  const originalImage = await image.elementHandle();
  const exported = () =>
    selection.evaluate(async (element) =>
      (
        await (element as CropperSelection).$toCanvas({ width: 100 })
      ).toDataURL(),
    );
  await page
    .getByRole('button', { name: 'Transformations', exact: true })
    .click();
  await page
    .getByRole('combobox', { name: 'Initial fit:', exact: true })
    .selectOption('cover');
  await expect(image).toHaveJSProperty('initialFit', 'cover');
  expect(await originalImage?.evaluate((element) => element.isConnected)).toBe(
    true,
  );
  const afterFit = await exported();
  await page
    .getByRole('button', { name: 'Basic Controls', exact: true })
    .click();
  await page.getByRole('button', { name: 'Image 2', exact: true }).click();
  await expect.poll(exported).not.toBe(afterFit);
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await page.getByRole('button', { name: 'Crop Image', exact: true }).click();
  await expect(
    page.getByRole('img', { name: 'Cropped', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('applies image inset limits and uses the image center for wheel zoom', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'vite-react19',
    'Interactive Vite demo controls',
  );
  const { errors, image } = await openApp(page, testInfo.project.name);
  await page.getByLabel('Image minimum inset:', { exact: true }).fill('0');
  await page.getByLabel('Zoom image around center', { exact: true }).check();
  const bounds = await image.boundingBox();
  if (!bounds) throw new Error('Image has no bounds');
  const before = await image.evaluate((element) =>
    (element as CropperImage).$getTransform(),
  );
  await image.evaluate((element) => (element as CropperImage).$move(-10000, 0));
  expect(
    await image.evaluate((element) =>
      (element as CropperImage).$getTransform(),
    ),
  ).toEqual(before);
  // Wheel over the image outside the selection, so only the image zooms.
  await page.mouse.move(
    bounds.x + bounds.width * 0.1,
    bounds.y + bounds.height * 0.1,
  );
  await page.mouse.wheel(0, 100);
  await expect
    .poll(() =>
      image.evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeLessThan(bounds.width);
  const after = await image.boundingBox();
  if (!after) throw new Error('Image has no bounds after zoom');
  expect(after.x + after.width / 2).toBeCloseTo(bounds.x + bounds.width / 2, 1);
  expect(after.y + after.height / 2).toBeCloseTo(
    bounds.y + bounds.height / 2,
    1,
  );
  expect(errors).toEqual([]);
});

test('refreshes crop data and the live preview after selection and image changes', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'vite-react19',
    'Interactive Vite demo controls',
  );
  const { errors, selection } = await openApp(page, testInfo.project.name);
  const rectangle = await selection.evaluate((element) => {
    const selection = element as CropperSelection;
    selection.$move(5, 5);
    return {
      x: selection.x,
      y: selection.y,
      width: selection.width,
      height: selection.height,
    };
  });
  await expect(page.locator('.crop-data')).toContainText(
    `X: ${Math.round(rectangle.x)}`,
  );
  await expect(page.locator('.crop-data')).toContainText(
    `Y: ${Math.round(rectangle.y)}`,
  );
  await page
    .getByRole('button', { name: 'Basic Controls', exact: true })
    .click();
  await page.getByRole('button', { name: 'Image 2', exact: true }).click();
  const exported = await selection.evaluate(async (element) =>
    (await (element as CropperSelection).$toCanvas()).toDataURL(),
  );
  await expect(
    page.getByRole('img', { name: 'Live Preview', exact: true }),
  ).toHaveAttribute('src', exported);
  expect(errors).toEqual([]);
});

test('restores the original transform when the same flip is applied twice', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'vite-react19',
    'Interactive Vite demo controls',
  );
  const { errors, image } = await openApp(page, testInfo.project.name);
  const transform = () =>
    image.evaluate((element) => (element as CropperImage).$getTransform());
  const before = await transform();
  await page
    .getByRole('button', { name: 'Transformations', exact: true })
    .click();
  for (const name of ['Flip Horizontal', 'Flip Vertical']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect.poll(transform).not.toEqual(before);
    await page.getByRole('button', { name, exact: true }).click();
    await expect.poll(transform).toEqual(before);
  }
  expect(errors).toEqual([]);
});

test('downloads the chosen format and retains the generated result format', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'vite-react19',
    'Interactive Vite demo controls',
  );
  const { errors } = await openApp(page, testInfo.project.name);
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Format:', exact: true })
    .selectOption('jpeg');
  const downloading = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Download Image', exact: true })
    .click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/\.jpeg$/);
  const path = await download.path();
  if (!path) throw new Error('Download did not produce a file');
  const bytes = await readFile(path);
  expect(bytes.subarray(0, 3).toString('hex')).toBe('ffd8ff');

  await page.getByRole('button', { name: 'Crop Image', exact: true }).click();
  await expect(
    page.getByRole('img', { name: 'Cropped', exact: true }),
  ).toHaveAttribute('src', /^data:image\/jpeg;/);
  await page
    .getByRole('combobox', { name: 'Format:', exact: true })
    .selectOption('png');
  await expect(page.locator('.result-section a[download]')).toHaveAttribute(
    'download',
    'cropped.jpeg',
  );
  expect(errors).toEqual([]);
});
