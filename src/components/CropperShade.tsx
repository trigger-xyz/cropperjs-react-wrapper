import type { CropperShade as CropperShadeElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
} from 'react';
import { useForwardedRef } from '../hooks';

export interface CropperShadeProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  slottable?: boolean;
  borderRadius?: string;
  themeColor?: string;
}

export const CropperShade = forwardRef<CropperShadeElement, CropperShadeProps>(
  ({ borderRadius, themeColor, ...rest }, ref) => {
    const elementRef = useForwardedRef<CropperShadeElement>(ref);

    // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      if (borderRadius !== undefined) el.borderRadius = borderRadius;
      if (themeColor !== undefined) el.themeColor = themeColor;
    }, [borderRadius, themeColor]);

    return (
      // @ts-expect-error web component
      <cropper-shade ref={elementRef} border-radius={borderRadius} {...rest} />
    );
  },
);

CropperShade.displayName = 'CropperShade';
