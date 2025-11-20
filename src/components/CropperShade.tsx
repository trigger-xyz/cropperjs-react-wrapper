import type { CropperShade as CropperShadeElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

export interface CropperShadeProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  themeColor?: string;
}

export const CropperShade = forwardRef<CropperShadeElement, CropperShadeProps>(
  ({ themeColor, ...rest }, ref) => {
    const elementRef = useRef<CropperShadeElement>(null);

    useImperativeHandle(
      ref,
      () => elementRef.current as CropperShadeElement,
      [],
    );

    // Update props
    useEffect(() => {
      if (!elementRef.current) return;
      const element = elementRef.current;

      if (themeColor !== undefined) element.themeColor = themeColor;
    }, [themeColor]);

    return (
      // @ts-expect-error
      <cropper-shade ref={elementRef} {...rest} />
    );
  },
);
