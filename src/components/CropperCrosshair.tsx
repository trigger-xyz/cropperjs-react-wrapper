import type { CropperCrosshair as CropperCrosshairElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
} from 'react';
import { useForwardedRef } from '../hooks';

export interface CropperCrosshairProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  centered?: boolean;
  themeColor?: string;
}

export const CropperCrosshair = forwardRef<
  CropperCrosshairElement,
  CropperCrosshairProps
>(({ centered, themeColor, ...rest }, ref) => {
  const elementRef = useForwardedRef<CropperCrosshairElement>(ref);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    if (centered !== undefined) el.centered = centered;
    if (themeColor !== undefined) el.themeColor = themeColor;
  }, [centered, themeColor]);

  return (
    // @ts-expect-error web component
    <cropper-crosshair ref={elementRef} {...rest} />
  );
});

CropperCrosshair.displayName = 'CropperCrosshair';
