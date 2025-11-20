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
  useImperativeHandle,
  useRef,
} from 'react';

export interface CropperSelectionProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>,
    'onChange'
  > {
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
    const elementRef = useRef<CropperSelectionElement>(null);

    useImperativeHandle(
      ref,
      () => elementRef.current as CropperSelectionElement,
      [],
    );

    // Update props
    useEffect(() => {
      if (!elementRef.current) return;
      const element = elementRef.current;

      if (aspectRatio !== undefined) element.aspectRatio = aspectRatio;
      if (initialAspectRatio !== undefined)
        element.initialAspectRatio = initialAspectRatio;
      if (initialCoverage !== undefined)
        element.initialCoverage = initialCoverage;
      if (movable !== undefined) element.movable = movable;
      if (resizable !== undefined) element.resizable = resizable;
      if (zoomable !== undefined) element.zoomable = zoomable;
      if (multiple !== undefined) element.multiple = multiple;
      if (keyboard !== undefined) element.keyboard = keyboard;
      if (outlined !== undefined) element.outlined = outlined;
      if (precise !== undefined) element.precise = precise;
      if (themeColor !== undefined) element.themeColor = themeColor;
    }, [
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
      themeColor,
    ]);

    // Event listeners
    useEffect(() => {
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
    }, [onAction, onActionStart, onActionMove, onActionEnd, onChange]);

    // Limit selection to image bounds
    useEffect(() => {
      if (!bounded) {
        return;
      }
      const element = elementRef.current;
      if (!element || !bounded) return;

      const handleLimit = (event: CustomEvent) => {
        const image = element.parentElement?.querySelector(
          'cropper-image',
        ) as CropperImageElement;
        if (!image) {
          return;
        }

        const canvas = element.parentElement as CropperCanvasElement;
        if (!canvas) {
          return;
        }

        const canvasRect = canvas.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        const selection = event.detail;

        // Calculate image boundaries relative to canvas
        const maxSelection = {
          x: imageRect.left - canvasRect.left,
          y: imageRect.top - canvasRect.top,
          width: imageRect.width,
          height: imageRect.height,
        };

        // Check if selection is within image bounds
        const isWithinBounds =
          selection.x >= maxSelection.x &&
          selection.y >= maxSelection.y &&
          selection.x + selection.width <=
            maxSelection.x + maxSelection.width &&
          selection.y + selection.height <=
            maxSelection.y + maxSelection.height;

        if (!isWithinBounds) {
          event.preventDefault();
        }
      };

      element.addEventListener(
        'change',
        handleLimit as unknown as EventListener,
      );
      return () => {
        element.removeEventListener(
          'change',
          handleLimit as unknown as EventListener,
        );
      };
    }, [bounded]);

    return (
      // @ts-expect-error
      <cropper-selection ref={elementRef} {...rest}>
        {children}
        {/* @ts-ignore */}
      </cropper-selection>
    );
  },
);
