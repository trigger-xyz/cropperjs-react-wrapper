import { render, waitFor } from '@testing-library/react';
import type {
  CropperCanvas as CropperCanvasElement,
  CropperCrosshair as CropperCrosshairElement,
  CropperGrid as CropperGridElement,
  CropperHandle as CropperHandleElement,
  CropperImage as CropperImageElement,
  CropperSelection as CropperSelectionElement,
  CropperShade as CropperShadeElement,
  CropperViewer as CropperViewerElement,
} from 'cropperjs';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { CropperActionEvent } from '../events';
import { CropperCanvas } from './CropperCanvas';
import { CropperCrosshair } from './CropperCrosshair';
import { CropperGrid } from './CropperGrid';
import { CropperHandle } from './CropperHandle';
import { CropperImage } from './CropperImage';
import { CropperSelection } from './CropperSelection';
import { CropperShade } from './CropperShade';
import { CropperViewer } from './CropperViewer';

// -- CropperCanvas --

describe('CropperCanvas', () => {
  it('renders cropper-canvas element', () => {
    const { container } = render(<CropperCanvas />);
    expect(container.querySelector('cropper-canvas')).toBeInTheDocument();
  });

  it('renders children inside the element', () => {
    const { container } = render(
      <CropperCanvas>
        <span data-testid="child">hello</span>
      </CropperCanvas>,
    );
    const canvas = container.querySelector('cropper-canvas');
    expect(canvas?.querySelector('[data-testid="child"]')).toBeInTheDocument();
  });

  it('sets props as properties', async () => {
    const { container } = render(
      <CropperCanvas
        background={true}
        disabled={true}
        scaleStep={0.2}
        themeColor="red"
      />,
    );
    const el = container.querySelector(
      'cropper-canvas',
    ) as CropperCanvasElement;
    await waitFor(() => {
      expect(el.background).toBe(true);
      expect(el.disabled).toBe(true);
      expect(el.scaleStep).toBe(0.2);
      expect(el.themeColor).toBe('red');
    });
  });

  it('forwards ref to the DOM element', () => {
    const ref = createRef<CropperCanvasElement>();
    const { container } = render(<CropperCanvas ref={ref} />);
    const el = container.querySelector('cropper-canvas');
    expect(ref.current).toBe(el);
  });

  it('calls event handlers when custom events fire', async () => {
    const onAction = vi.fn();
    const onChange = vi.fn();
    const onTransform = vi.fn();
    const { container } = render(
      <CropperCanvas
        onAction={onAction}
        onChange={onChange}
        onTransform={onTransform}
      />,
    );
    const el = container.querySelector('cropper-canvas') as HTMLElement;

    el.dispatchEvent(new CustomEvent('action', { detail: { action: 'move' } }));
    el.dispatchEvent(new CustomEvent('change', { detail: { x: 0, y: 0 } }));
    el.dispatchEvent(
      new CustomEvent('transform', { detail: { matrix: [1, 0, 0, 1, 0, 0] } }),
    );

    await waitFor(() => {
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onTransform).toHaveBeenCalledTimes(1);
    });
  });

  it('allows action handlers to prevent Cropper.js default behavior', () => {
    const onAction = vi.fn((event: CropperActionEvent) => {
      expect(event.detail.action).toBe('scale');
      expect(event.detail.scale).toBe(0.1);
      expect(event.detail.centerX).toBe(50);
      expect(event.detail.centerY).toBe(40);
      event.preventDefault();
    });
    const { container } = render(<CropperCanvas onAction={onAction} />);
    const el = container.querySelector('cropper-canvas') as HTMLElement;
    const event: CropperActionEvent = new CustomEvent('action', {
      cancelable: true,
      detail: {
        action: 'scale',
        relatedEvent: new WheelEvent('wheel'),
        scale: 0.1,
        centerX: 50,
        centerY: 40,
      },
    });

    expect(el.dispatchEvent(event)).toBe(false);
    expect(event.defaultPrevented).toBe(true);
    expect(onAction).toHaveBeenCalledWith(event);
  });

  it('runs preventable action handlers before Cropper.js element handlers', () => {
    const onAction = vi.fn((event: CropperActionEvent) => {
      event.preventDefault();
    });
    const { container } = render(
      <CropperCanvas onAction={onAction}>
        <CropperImage />
      </CropperCanvas>,
    );
    const canvas = container.querySelector('cropper-canvas') as HTMLElement;
    const image = container.querySelector(
      'cropper-image',
    ) as CropperImageElement;
    const zoom = vi.spyOn(image, '$zoom');
    const event = new CustomEvent('action', {
      bubbles: true,
      cancelable: true,
      detail: {
        action: 'scale',
        scale: 0.1,
      },
    }) as CropperActionEvent;

    canvas.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onAction).toHaveBeenCalledWith(event);
    expect(zoom).not.toHaveBeenCalled();
  });

  it('updates properties when props change', async () => {
    const { container, rerender } = render(
      <CropperCanvas background={false} themeColor="blue" />,
    );
    const el = container.querySelector(
      'cropper-canvas',
    ) as CropperCanvasElement;

    await waitFor(() => expect(el.background).toBe(false));

    rerender(<CropperCanvas background={true} themeColor="green" />);

    await waitFor(() => {
      expect(el.background).toBe(true);
      expect(el.themeColor).toBe('green');
    });
  });
});

// -- CropperImage --

describe('CropperImage', () => {
  it('renders cropper-image element', () => {
    const { container } = render(<CropperImage />);
    expect(container.querySelector('cropper-image')).toBeInTheDocument();
  });

  it('sets props as properties', async () => {
    const { container } = render(
      <CropperImage src="test.jpg" alt="Test" crossOrigin="anonymous" />,
    );
    const el = container.querySelector('cropper-image') as CropperImageElement;
    await waitFor(() => {
      expect(el.src).toBe('test.jpg');
      expect(el.alt).toBe('Test');
      expect(el.crossorigin).toBe('anonymous');
    });
  });

  it('sets and removes native image properties and attributes', async () => {
    const { container, rerender } = render(
      <CropperImage
        src="test.jpg"
        alt="Responsive image"
        crossOrigin="anonymous"
        decoding="async"
        elementTiming="cropper-hero"
        fetchPriority="high"
        loading="lazy"
        referrerPolicy="no-referrer"
        sizes="100vw"
        srcSet="small.jpg 480w, large.jpg 960w"
      />,
    );
    const el = container.querySelector('cropper-image') as CropperImageElement;

    await waitFor(() => {
      expect(el.crossorigin).toBe('anonymous');
      expect(el.decoding).toBe('async');
      expect(el.elementtiming).toBe('cropper-hero');
      expect(el.fetchpriority).toBe('high');
      expect(el.loading).toBe('lazy');
      expect(el.referrerpolicy).toBe('no-referrer');
      expect(el.sizes).toBe('100vw');
      expect(el.srcset).toBe('small.jpg 480w, large.jpg 960w');
      expect(el.$image.getAttribute('loading')).toBe('lazy');
      expect(el.$image.getAttribute('srcset')).toBe(
        'small.jpg 480w, large.jpg 960w',
      );
    });

    rerender(<CropperImage src="test.jpg" />);

    await waitFor(() => {
      for (const attribute of [
        'alt',
        'crossorigin',
        'decoding',
        'elementtiming',
        'fetchpriority',
        'loading',
        'referrerpolicy',
        'sizes',
        'srcset',
      ]) {
        expect(el).not.toHaveAttribute(attribute);
        expect(el.$image).not.toHaveAttribute(attribute);
      }
    });
  });

  it('forwards ref', () => {
    const ref = createRef<CropperImageElement>();
    const { container } = render(<CropperImage ref={ref} />);
    expect(ref.current).toBe(container.querySelector('cropper-image'));
  });

  it('keeps supporting the deprecated initialCenterSize prop', async () => {
    const { container } = render(<CropperImage initialCenterSize="cover" />);
    const el = container.querySelector('cropper-image') as CropperImageElement;
    await waitFor(() => {
      expect(el.initialCenterSize).toBe('cover');
    });
  });

  it('sets Cropper.js 2.2 image fit props before and after mount', async () => {
    const { container } = render(
      <CropperImage initialFit="fill" maxFit="none" minFit="scale-down" />,
    );
    const el = container.querySelector('cropper-image') as CropperImageElement;

    expect(el).toHaveAttribute('initial-fit', 'fill');
    expect(el).toHaveAttribute('max-fit', 'none');
    expect(el).toHaveAttribute('min-fit', 'scale-down');
    await waitFor(() => {
      expect(el.initialFit).toBe('fill');
      expect(el.maxFit).toBe('none');
      expect(el.minFit).toBe('scale-down');
    });
  });

  it('calls the new cancelable image change handler', () => {
    const onChange = vi.fn((event: CustomEvent) => event.preventDefault());
    const { container } = render(<CropperImage onChange={onChange} />);
    const el = container.querySelector('cropper-image') as HTMLElement;
    const detail = { x: 10, y: 20, width: 300, height: 200 };
    const event = new CustomEvent('change', { cancelable: true, detail });

    expect(el.dispatchEvent(event)).toBe(false);
    expect(event.defaultPrevented).toBe(true);
    expect(onChange).toHaveBeenCalledWith(event);
    expect(onChange.mock.calls[0]?.[0].detail).toEqual(detail);
  });

  it('sets transform capability props', async () => {
    const { container } = render(
      <CropperImage
        rotatable={true}
        scalable={true}
        skewable={false}
        translatable={true}
      />,
    );
    const el = container.querySelector('cropper-image') as CropperImageElement;
    await waitFor(() => {
      expect(el.rotatable).toBe(true);
      expect(el.scalable).toBe(true);
      expect(el.skewable).toBe(false);
      expect(el.translatable).toBe(true);
    });
  });
});

// -- CropperSelection --

describe('CropperSelection', () => {
  it('renders cropper-selection element', () => {
    const { container } = render(<CropperSelection />);
    expect(container.querySelector('cropper-selection')).toBeInTheDocument();
  });

  it('sets props as properties', async () => {
    const { container } = render(
      <CropperSelection
        aspectRatio={1.5}
        initialCoverage={0.8}
        movable={false}
      />,
    );
    const el = container.querySelector(
      'cropper-selection',
    ) as CropperSelectionElement;
    await waitFor(() => {
      expect(el.aspectRatio).toBe(1.5);
      expect(el.initialCoverage).toBe(0.8);
      expect(el.movable).toBe(false);
    });
  });

  it('forwards ref', () => {
    const ref = createRef<CropperSelectionElement>();
    const { container } = render(<CropperSelection ref={ref} />);
    expect(ref.current).toBe(container.querySelector('cropper-selection'));
  });

  it('sets dynamic prop', async () => {
    const { container } = render(<CropperSelection dynamic={true} />);
    const el = container.querySelector(
      'cropper-selection',
    ) as CropperSelectionElement;
    await waitFor(() => {
      expect(el.dynamic).toBe(true);
    });
  });

  it('sets active prop', async () => {
    const { container } = render(<CropperSelection active={true} />);
    const el = container.querySelector(
      'cropper-selection',
    ) as CropperSelectionElement;
    await waitFor(() => {
      expect(el.active).toBe(true);
    });
  });

  it('sets position and size props', async () => {
    const { container } = render(
      <CropperSelection x={10} y={20} width={100} height={200} />,
    );
    const el = container.querySelector(
      'cropper-selection',
    ) as CropperSelectionElement;
    await waitFor(() => {
      expect(el.x).toBe(10);
      expect(el.y).toBe(20);
      expect(el.width).toBe(100);
      expect(el.height).toBe(200);
    });
  });

  it('keeps multiple fixed selections initialized from props', async () => {
    const { container } = render(
      <CropperCanvas>
        {[
          { id: 'selection-a', x: 10, y: 20 },
          { id: 'selection-b', x: 40, y: 50 },
          { id: 'selection-c', x: 70, y: 80 },
        ].map((selection) => (
          <CropperSelection
            key={selection.id}
            id={selection.id}
            x={selection.x}
            y={selection.y}
            width={100}
            height={120}
            movable
            resizable
            zoomable
            multiple
            keyboard
            outlined
          />
        ))}
      </CropperCanvas>,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('cropper-selection')).toHaveLength(3);
    });

    expect(
      Array.from(container.querySelectorAll('cropper-selection')).map(
        (selection) => selection.id,
      ),
    ).toEqual(['selection-a', 'selection-b', 'selection-c']);
  });

  it('calls event handlers', async () => {
    const onChange = vi.fn();
    const onActionStart = vi.fn();
    const { container } = render(
      <CropperSelection onChange={onChange} onActionStart={onActionStart} />,
    );
    const el = container.querySelector('cropper-selection') as HTMLElement;

    el.dispatchEvent(
      new CustomEvent('change', {
        detail: { x: 1, y: 2, width: 3, height: 4 },
      }),
    );
    el.dispatchEvent(new CustomEvent('actionstart', { detail: {} }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onActionStart).toHaveBeenCalledTimes(1);
    });
  });

  it('renders children', () => {
    const { container } = render(
      <CropperSelection>
        <span data-testid="inner">grid</span>
      </CropperSelection>,
    );
    const selection = container.querySelector('cropper-selection');
    expect(
      selection?.querySelector('[data-testid="inner"]'),
    ).toBeInTheDocument();
  });
});

// -- CropperGrid --

describe('CropperGrid', () => {
  it('renders cropper-grid element', () => {
    const { container } = render(<CropperGrid />);
    expect(container.querySelector('cropper-grid')).toBeInTheDocument();
  });

  it('sets props as properties', async () => {
    const { container } = render(
      <CropperGrid columns={4} rows={5} bordered={true} covered={false} />,
    );
    const el = container.querySelector('cropper-grid') as CropperGridElement;
    await waitFor(() => {
      expect(el.columns).toBe(4);
      expect(el.rows).toBe(5);
      expect(el.bordered).toBe(true);
      expect(el.covered).toBe(false);
    });
  });

  it('forwards ref', () => {
    const ref = createRef<CropperGridElement>();
    const { container } = render(<CropperGrid ref={ref} />);
    expect(ref.current).toBe(container.querySelector('cropper-grid'));
  });
});

// -- CropperHandle --

describe('CropperHandle', () => {
  it('renders cropper-handle element', () => {
    const { container } = render(<CropperHandle action="move" />);
    expect(container.querySelector('cropper-handle')).toBeInTheDocument();
  });

  it('sets props as properties', async () => {
    const { container } = render(
      <CropperHandle action="n-resize" plain={true} themeColor="red" />,
    );
    const el = container.querySelector(
      'cropper-handle',
    ) as CropperHandleElement;
    await waitFor(() => {
      expect(el.action).toBe('n-resize');
      expect(el.plain).toBe(true);
      expect(el.themeColor).toBe('red');
    });
  });

  it('forwards ref', () => {
    const ref = createRef<CropperHandleElement>();
    const { container } = render(<CropperHandle ref={ref} action="move" />);
    expect(ref.current).toBe(container.querySelector('cropper-handle'));
  });
});

// -- CropperCrosshair --

describe('CropperCrosshair', () => {
  it('renders cropper-crosshair element', () => {
    const { container } = render(<CropperCrosshair />);
    expect(container.querySelector('cropper-crosshair')).toBeInTheDocument();
  });

  it('sets props as properties', async () => {
    const { container } = render(
      <CropperCrosshair centered={true} themeColor="green" />,
    );
    const el = container.querySelector(
      'cropper-crosshair',
    ) as CropperCrosshairElement;
    await waitFor(() => {
      expect(el.centered).toBe(true);
      expect(el.themeColor).toBe('green');
    });
  });

  it('forwards ref', () => {
    const ref = createRef<CropperCrosshairElement>();
    const { container } = render(<CropperCrosshair ref={ref} />);
    expect(ref.current).toBe(container.querySelector('cropper-crosshair'));
  });
});

// -- CropperShade --

describe('CropperShade', () => {
  it('renders cropper-shade element', () => {
    const { container } = render(<CropperShade />);
    expect(container.querySelector('cropper-shade')).toBeInTheDocument();
  });

  it('sets themeColor prop', async () => {
    const { container } = render(<CropperShade themeColor="purple" />);
    const el = container.querySelector('cropper-shade') as CropperShadeElement;
    await waitFor(() => {
      expect(el.themeColor).toBe('purple');
    });
  });

  it('forwards ref', () => {
    const ref = createRef<CropperShadeElement>();
    const { container } = render(<CropperShade ref={ref} />);
    expect(ref.current).toBe(container.querySelector('cropper-shade'));
  });
});

// -- CropperViewer --

describe('CropperViewer', () => {
  it('renders cropper-viewer element', () => {
    const { container } = render(<CropperViewer />);
    expect(container.querySelector('cropper-viewer')).toBeInTheDocument();
  });

  it('sets props as properties', async () => {
    const { container } = render(
      <CropperViewer
        resize="horizontal"
        selection="#my-selection"
        themeColor="orange"
      />,
    );
    const el = container.querySelector(
      'cropper-viewer',
    ) as CropperViewerElement;
    await waitFor(() => {
      expect(el.resize).toBe('horizontal');
      expect(el.selection).toBe('#my-selection');
      expect(el.themeColor).toBe('orange');
    });
  });

  it('forwards ref', () => {
    const ref = createRef<CropperViewerElement>();
    const { container } = render(<CropperViewer ref={ref} />);
    expect(ref.current).toBe(container.querySelector('cropper-viewer'));
  });
});

describe('shared CropperElement props', () => {
  const selectors = [
    'cropper-canvas',
    'cropper-image',
    'cropper-selection',
    'cropper-shade',
    'cropper-handle',
    'cropper-grid',
    'cropper-crosshair',
    'cropper-viewer',
  ];

  const renderElements = (slottable: boolean) => (
    <>
      <CropperCanvas slottable={slottable} />
      <CropperImage slottable={slottable} />
      <CropperSelection slottable={slottable} />
      <CropperShade slottable={slottable} />
      <CropperHandle action="none" slottable={slottable} />
      <CropperGrid slottable={slottable} />
      <CropperCrosshair slottable={slottable} />
      <CropperViewer slottable={slottable} />
    </>
  );

  it('sets and updates slottable on every wrapper', async () => {
    const { container, rerender } = render(renderElements(true));

    await waitFor(() => {
      for (const selector of selectors) {
        const element = container.querySelector(selector) as HTMLElement & {
          slottable: boolean;
        };
        expect(element.slottable).toBe(true);
        expect(element).toHaveAttribute('slottable');
      }
    });

    rerender(renderElements(false));

    await waitFor(() => {
      for (const selector of selectors) {
        const element = container.querySelector(selector) as HTMLElement & {
          slottable: boolean;
        };
        expect(element.slottable).toBe(false);
        expect(element).not.toHaveAttribute('slottable');
      }
    });
  });
});
