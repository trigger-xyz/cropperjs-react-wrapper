import type { CropperViewer as CropperViewerElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
} from 'react';
import { useForwardedRef } from '../hooks';

export interface CropperViewerProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  resize?: 'both' | 'horizontal' | 'vertical' | 'none';
  selection?: string;
  themeColor?: string;
}

export const CropperViewer = forwardRef<
  CropperViewerElement,
  CropperViewerProps
>(({ resize, selection, themeColor, ...rest }, ref) => {
  const elementRef = useForwardedRef<CropperViewerElement>(ref);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    if (resize !== undefined) el.resize = resize;
    if (selection !== undefined) el.selection = selection;
    if (themeColor !== undefined) el.themeColor = themeColor;
  }, [resize, selection, themeColor]);

  return (
    // @ts-expect-error web component
    <cropper-viewer ref={elementRef} {...rest} />
  );
});

CropperViewer.displayName = 'CropperViewer';
