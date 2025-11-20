import 'cropperjs';

import type { CropperCanvas as CropperCanvasElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';

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
  onResize?: (event: CustomEvent) => void;
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
      onResize,
      onTransform,
      children,
      ...rest
    },
    ref,
  ) => {
    const elementRef = useRef<CropperCanvasElement>(null);

    useImperativeHandle(
      ref,
      () => elementRef.current as CropperCanvasElement,
      [],
    );

    // Update props
    useEffect(() => {
      if (!elementRef.current) return;
      const element = elementRef.current;

      if (background !== undefined) element.background = background;
      if (disabled !== undefined) element.disabled = disabled;
      if (scaleStep !== undefined) element.scaleStep = scaleStep;
      if (themeColor !== undefined) element.themeColor = themeColor;
    }, [background, disabled, scaleStep, themeColor]);

    // Event listeners
    useLayoutEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const eventMap: Record<
        string,
        ((event: CustomEvent) => void) | undefined
      > = {
        action: onAction,
        actionstart: onActionStart,
        actionmove: onActionMove,
        actionend: onActionEnd,
        change: onChange,
        load: onLoad,
        error: onError,
        resize: onResize,
        transform: onTransform,
      };

      Object.entries(eventMap).forEach(([event, handler]) => {
        if (handler) {
          element.addEventListener(event, handler as unknown as EventListener);
        }
      });

      return () => {
        Object.entries(eventMap).forEach(([event, handler]) => {
          if (handler) {
            element.removeEventListener(
              event,
              handler as unknown as EventListener,
            );
          }
        });
      };
    }, [
      onAction,
      onActionStart,
      onActionMove,
      onActionEnd,
      onChange,
      onLoad,
      onError,
      onResize,
      onTransform,
    ]);

    return (
      // @ts-expect-error
      <cropper-canvas ref={elementRef} {...rest}>
        {children}
        {/* @ts-ignore */}
      </cropper-canvas>
    );
  },
);
