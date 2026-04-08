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
import { useCustomEvents, useForwardedRef } from '../hooks';

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
  themeColor?: string;
  onAction?: (event: CustomEvent) => void;
  onActionStart?: (event: CustomEvent) => void;
  onActionMove?: (event: CustomEvent) => void;
  onActionEnd?: (event: CustomEvent) => void;
  onChange?: (event: CustomEvent) => void;
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

    useCustomEvents(elementRef, {
      action: onAction,
      actionstart: onActionStart,
      actionmove: onActionMove,
      actionend: onActionEnd,
      change: onChange,
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
    useEffect(() => {
      const el = elementRef.current;
      if (!bounded || !el) return;

      const handleLimit = (event: CustomEvent) => {
        const canvas = el.parentElement as CropperCanvasElement | null;
        const image = canvas?.querySelector(
          'cropper-image',
        ) as CropperImageElement | null;
        if (!image || !canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        const selection = event.detail;

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

      el.addEventListener('change', handleLimit as unknown as EventListener);
      return () => {
        el.removeEventListener(
          'change',
          handleLimit as unknown as EventListener,
        );
      };
    }, [bounded]);

    return (
      // @ts-expect-error web component
      <cropper-selection ref={elementRef} {...rest}>
        {children}
        {/* @ts-ignore closing tag */}
      </cropper-selection>
    );
  },
);

CropperSelection.displayName = 'CropperSelection';
