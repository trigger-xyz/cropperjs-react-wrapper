import type {
  CropperCanvas as CropperCanvasElement,
  CropperImage as CropperImageElement,
  CropperSelection as CropperSelectionElement,
} from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
} from 'react';
import type {
  CropperActionEndEvent,
  CropperActionEvent,
  CropperActionMoveEvent,
  CropperActionStartEvent,
} from '../events';
import { useCustomEvents, useForwardedRef } from '../hooks';

export interface CropperSelectionChangeEventDetail {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CropperSelectionChangeEvent =
  CustomEvent<CropperSelectionChangeEventDetail>;

export interface CropperSelectionProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>,
    'onChange'
  > {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  initialAspectRatio?: number;
  initialCoverage?: number;
  /** CSS border radius applied to the selection and exported canvas. */
  borderRadius?: string;
  /** Maximum edge distances from the parent, using CSS inset syntax. */
  maxInset?: string;
  /** Minimum edge distances from the parent, using CSS inset syntax. */
  minInset?: string;
  resizeAroundCenter?: boolean;
  zoomAroundCenter?: boolean;
  movable?: boolean;
  resizable?: boolean;
  zoomable?: boolean;
  multiple?: boolean;
  keyboard?: boolean;
  outlined?: boolean;
  precise?: boolean;
  dynamic?: boolean;
  active?: boolean;
  bounded?: boolean;
  slottable?: boolean;
  themeColor?: string;
  onAction?: (event: CropperActionEvent) => void;
  onActionStart?: (event: CropperActionStartEvent) => void;
  onActionMove?: (event: CropperActionMoveEvent) => void;
  onActionEnd?: (event: CropperActionEndEvent) => void;
  onChange?: (event: CropperSelectionChangeEvent) => void;
}

export const CropperSelection = forwardRef<
  CropperSelectionElement,
  CropperSelectionProps
>(
  (
    {
      x,
      y,
      width,
      height,
      aspectRatio,
      initialAspectRatio,
      initialCoverage,
      borderRadius = '',
      maxInset = 'auto',
      minInset = 'auto',
      resizeAroundCenter = false,
      zoomAroundCenter = false,
      movable,
      resizable,
      zoomable,
      multiple,
      keyboard,
      outlined,
      precise,
      dynamic,
      active,
      bounded,
      themeColor,
      onAction,
      onActionStart,
      onActionMove,
      onActionEnd,
      onChange,
      children,
      ...rest
    },
    ref,
  ) => {
    const elementRef = useForwardedRef<CropperSelectionElement>(ref);

    // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      if (x !== undefined) el.x = x;
      if (y !== undefined) el.y = y;
      if (width !== undefined) el.width = width;
      if (height !== undefined) el.height = height;
      if (aspectRatio !== undefined) el.aspectRatio = aspectRatio;
      if (initialAspectRatio !== undefined)
        el.initialAspectRatio = initialAspectRatio;
      if (initialCoverage !== undefined) el.initialCoverage = initialCoverage;
      if (movable !== undefined) el.movable = movable;
      if (resizable !== undefined) el.resizable = resizable;
      if (zoomable !== undefined) el.zoomable = zoomable;
      if (multiple !== undefined) el.multiple = multiple;
      if (keyboard !== undefined) el.keyboard = keyboard;
      if (outlined !== undefined) el.outlined = outlined;
      if (precise !== undefined) el.precise = precise;
      if (dynamic !== undefined) el.dynamic = dynamic;
      if (active !== undefined) el.active = active;
      if (themeColor !== undefined) el.themeColor = themeColor;
    }, [
      x,
      y,
      width,
      height,
      aspectRatio,
      initialAspectRatio,
      initialCoverage,
      movable,
      resizable,
      zoomable,
      multiple,
      keyboard,
      outlined,
      precise,
      dynamic,
      active,
      themeColor,
    ]);

    // Changing appearance or behavior must not reapply the initial geometry.
    // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      el.borderRadius = borderRadius;
      el.maxInset = maxInset;
      el.minInset = minInset;
      el.resizeAroundCenter = resizeAroundCenter;
      el.zoomAroundCenter = zoomAroundCenter;
    }, [
      borderRadius,
      maxInset,
      minInset,
      resizeAroundCenter,
      zoomAroundCenter,
    ]);

    useCustomEvents(elementRef, {
      action: onAction,
      actionstart: onActionStart,
      actionmove: onActionMove,
      actionend: onActionEnd,
    });

    // Viewers register target listeners when they connect, before React effects.
    // Cancel changes in capture so those listeners see the accepted geometry.
    useCustomEvents(elementRef, { change: onChange }, { capture: true });

    // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
    useEffect(() => {
      const el = elementRef.current;
      if (!bounded || !el) return;

      const handleLimit = (event: Event) => {
        const canvas = el.parentElement as CropperCanvasElement | null;
        const image = canvas?.querySelector(
          'cropper-image',
        ) as CropperImageElement | null;
        if (!image || !canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        const selection = (event as CropperSelectionChangeEvent).detail;

        const bounds = {
          x: imageRect.left - canvasRect.left,
          y: imageRect.top - canvasRect.top,
          width: imageRect.width,
          height: imageRect.height,
        };

        const isWithinBounds =
          selection.x >= bounds.x &&
          selection.y >= bounds.y &&
          selection.x + selection.width <= bounds.x + bounds.width &&
          selection.y + selection.height <= bounds.y + bounds.height;

        if (!isWithinBounds) {
          event.preventDefault();
        }
      };

      el.addEventListener('change', handleLimit, { capture: true });
      return () => {
        el.removeEventListener('change', handleLimit, { capture: true });
      };
    }, [bounded]);

    return (
      // @ts-expect-error web component
      <cropper-selection
        ref={elementRef}
        x={x}
        y={y}
        width={width}
        height={height}
        aspect-ratio={aspectRatio}
        initial-aspect-ratio={initialAspectRatio}
        initial-coverage={initialCoverage}
        border-radius={borderRadius}
        max-inset={maxInset}
        min-inset={minInset}
        resize-around-center={resizeAroundCenter ? '' : undefined}
        zoom-around-center={zoomAroundCenter ? '' : undefined}
        movable={movable}
        resizable={resizable}
        zoomable={zoomable}
        multiple={multiple}
        keyboard={keyboard}
        outlined={outlined}
        precise={precise}
        dynamic={dynamic}
        active={active}
        theme-color={themeColor}
        {...rest}
      >
        {children}
        {/* @ts-ignore closing tag */}
      </cropper-selection>
    );
  },
);

CropperSelection.displayName = 'CropperSelection';
