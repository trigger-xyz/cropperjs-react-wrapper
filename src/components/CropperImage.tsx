import type { CropperImage as CropperImageElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

export interface CropperImageProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  src?: string;
  alt?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  rotatable?: boolean;
  scalable?: boolean;
  skewable?: boolean;
  translatable?: boolean;
  onReady?: (image: CropperImageElement) => void;
}

export const CropperImage = forwardRef<CropperImageElement, CropperImageProps>(
  (
    {
      src,
      alt,
      crossOrigin,
      rotatable,
      scalable,
      skewable,
      translatable,
      onReady,
      ...rest
    },
    ref,
  ) => {
    const elementRef = useRef<CropperImageElement>(null);

    useImperativeHandle(
      ref,
      () => elementRef.current as CropperImageElement,
      [],
    );

    // Handle ready event
    useEffect(() => {
      const element = elementRef.current;
      if (!element || !onReady) return;

      setTimeout(() => {
        onReady(element);
      }, 0);
    }, [onReady]);

    // Update props
    useEffect(() => {
      if (!elementRef.current) return;
      const element = elementRef.current;

      if (src !== undefined) element.src = src;
      if (alt !== undefined) element.alt = alt;
      if (crossOrigin !== undefined) element.crossorigin = crossOrigin;
      if (rotatable !== undefined) element.rotatable = rotatable;
      if (scalable !== undefined) element.scalable = scalable;
      if (skewable !== undefined) element.skewable = skewable;
      if (translatable !== undefined) element.translatable = translatable;
    }, [src, alt, crossOrigin, rotatable, scalable, skewable, translatable]);

    return (
      // @ts-expect-error
      <cropper-image
        ref={elementRef}
        src={src}
        alt={alt}
        crossorigin={crossOrigin}
        {...rest}
      />
    );
  },
);
