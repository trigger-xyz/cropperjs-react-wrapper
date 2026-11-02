import type {
  CropperImage as CropperImageElement,
  CropperViewer as CropperViewerElement,
} from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useLayoutEffect,
} from 'react';
import { useForwardedRef } from '../hooks';

export interface CropperViewerProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  resize?: 'both' | 'horizontal' | 'vertical' | 'none';
  selection?: string;
  slottable?: boolean;
  themeColor?: string;
}

const CropperViewerInstance = forwardRef<
  CropperViewerElement,
  CropperViewerProps
>(({ resize = 'vertical', selection, themeColor, ...rest }, ref) => {
  const elementRef = useForwardedRef<CropperViewerElement>(ref);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    el.resize = resize;
    if (selection !== undefined) el.selection = selection;
    if (themeColor !== undefined) el.themeColor = themeColor;

    // The viewer must transform its clone even when the source image is locked.
    // Parent layout effects can attach portal containers after this effect.
    // Wait for them, but run before Cropper.js' preview-rendering timers.
    void el.$nextTick(() => {
      if (!el.isConnected) return;
      const preview = el
        .$getShadowRoot()
        ?.querySelector<CropperImageElement>('cropper-image');
      if (preview) preview.translatable = true;
    });
  }, [resize, selection, themeColor]);

  return (
    // @ts-expect-error web component
    <cropper-viewer
      ref={elementRef}
      resize={resize}
      selection={selection}
      theme-color={themeColor}
      {...rest}
    />
  );
});

CropperViewerInstance.displayName = 'CropperViewerInstance';

export const CropperViewer = forwardRef<
  CropperViewerElement,
  CropperViewerProps
>((props, ref) => (
  // Cropper.js binds selection listeners and computes the initial preview size
  // only when the viewer connects. Remount the instance when either changes.
  <CropperViewerInstance
    key={JSON.stringify([props.selection ?? '', props.resize ?? 'vertical'])}
    {...props}
    ref={ref}
  />
));

CropperViewer.displayName = 'CropperViewer';
