import type { CropperCrosshair as CropperCrosshairElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

export interface CropperCrosshairProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  centered?: boolean;
  themeColor?: string;
}

export const CropperCrosshair = forwardRef<
  CropperCrosshairElement,
  CropperCrosshairProps
>(({ centered, themeColor, ...rest }, ref) => {
  const elementRef = useRef<CropperCrosshairElement>(null);

  useImperativeHandle(
    ref,
    () => elementRef.current as CropperCrosshairElement,
    [],
  );

  // Update props
  useEffect(() => {
    if (!elementRef.current) return;
    const element = elementRef.current;

    if (centered !== undefined) element.centered = centered;
    if (themeColor !== undefined) element.themeColor = themeColor;
  }, [centered, themeColor]);

  return (
    // @ts-expect-error
    <cropper-crosshair ref={elementRef} {...rest} />
  );
});
