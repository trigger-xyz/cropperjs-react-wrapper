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
  themeColor?: string;
}

export const CropperShade = forwardRef<CropperShadeElement, CropperShadeProps>(
  ({ themeColor, ...rest }, ref) => {
    const elementRef = useForwardedRef<CropperShadeElement>(ref);

    // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      if (themeColor !== undefined) el.themeColor = themeColor;
    }, [themeColor]);

    return (
      // @ts-expect-error web component
      <cropper-shade ref={elementRef} {...rest} />
    );
  },
);

CropperShade.displayName = 'CropperShade';
