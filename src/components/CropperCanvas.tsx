import 'cropperjs';

import type { CropperCanvas as CropperCanvasElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
} from 'react';
import { useCustomEvents, useForwardedRef } from '../hooks';

export interface CropperCanvasProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>,
    'onChange' | 'onLoad' | 'onError'
  > {
  background?: boolean;
  disabled?: boolean;
  scaleStep?: number;
  themeColor?: string;
  onAction?: (event: CustomEvent) => void;
  onActionStart?: (event: CustomEvent) => void;
  onActionMove?: (event: CustomEvent) => void;
  onActionEnd?: (event: CustomEvent) => void;
  onChange?: (event: CustomEvent) => void;
  onLoad?: (event: CustomEvent) => void;
  onError?: (event: CustomEvent) => void;
  onTransform?: (event: CustomEvent) => void;
}

export const CropperCanvas = forwardRef<
  CropperCanvasElement,
  CropperCanvasProps
>(
  (
    {
      background,
      disabled,
      scaleStep,
      themeColor,
      onAction,
      onActionStart,
      onActionMove,
      onActionEnd,
      onChange,
      onLoad,
      onError,
      onTransform,
      children,
      ...rest
    },
    ref,
  ) => {
    const elementRef = useForwardedRef<CropperCanvasElement>(ref);

    // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      if (background !== undefined) el.background = background;
      if (disabled !== undefined) el.disabled = disabled;
      if (scaleStep !== undefined) el.scaleStep = scaleStep;
      if (themeColor !== undefined) el.themeColor = themeColor;
    }, [background, disabled, scaleStep, themeColor]);

    useCustomEvents(elementRef, {
      action: onAction,
      actionstart: onActionStart,
      actionmove: onActionMove,
      actionend: onActionEnd,
      change: onChange,
      load: onLoad,
      error: onError,
      transform: onTransform,
    });

    return (
      // @ts-expect-error web component
      <cropper-canvas ref={elementRef} {...rest}>
        {children}
        {/* @ts-ignore closing tag */}
      </cropper-canvas>
    );
  },
);

CropperCanvas.displayName = 'CropperCanvas';
