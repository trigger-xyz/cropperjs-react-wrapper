import { render } from '@testing-library/react';
import type {
  CropperCanvas as CropperCanvasElement,
  CropperImage as CropperImageElement,
  CropperSelection as CropperSelectionElement,
} from 'cropperjs';
import { describe, expect, it } from 'vitest';
import { CropperCanvas } from './CropperCanvas';
import { CropperImage } from './CropperImage';
import { CropperSelection } from './CropperSelection';

describe('CropperCanvas', () => {
  it('renders cropper-canvas element', () => {
    const { container } = render(<CropperCanvas />);
    const element = container.querySelector('cropper-canvas');
    expect(element).toBeInTheDocument();
  });

  it('sets props as properties', async () => {
    const { container } = render(
      <CropperCanvas background={true} disabled={true} themeColor="red" />,
    );
    const element = container.querySelector(
      'cropper-canvas',
    ) as CropperCanvasElement;
    // Wait for useEffect to run
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(element.background).toBe(true);
    expect(element.disabled).toBe(true);
    expect(element.themeColor).toBe('red');
  });
});

describe('CropperSelection', () => {
  it('renders cropper-selection element', () => {
    const { container } = render(<CropperSelection />);
    const element = container.querySelector('cropper-selection');
    expect(element).toBeInTheDocument();
  });

  it('sets props as properties', async () => {
    const { container } = render(
      <CropperSelection
        aspectRatio={1.5}
        initialCoverage={0.8}
        movable={false}
      />,
    );
    const element = container.querySelector(
      'cropper-selection',
    ) as CropperSelectionElement;
    // Wait for useEffect to run
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(element.aspectRatio).toBe(1.5);
    expect(element.initialCoverage).toBe(0.8);
    expect(element.movable).toBe(false);
  });
});

describe('CropperImage', () => {
  it('renders cropper-image element', () => {
    const { container } = render(<CropperImage />);
    const element = container.querySelector('cropper-image');
    expect(element).toBeInTheDocument();
  });

  it('sets props as properties', async () => {
    const { container } = render(
      <CropperImage src="test.jpg" alt="Test" crossOrigin="anonymous" />,
    );
    const element = container.querySelector(
      'cropper-image',
    ) as CropperImageElement;
    // Wait for useEffect to run
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(element.src).toBe('test.jpg');
    expect(element.alt).toBe('Test');
    expect(element.crossorigin).toBe('anonymous');
  });
});
