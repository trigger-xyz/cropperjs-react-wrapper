import type { CropperImage as CropperImageElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
} from 'react';
import { useForwardedRef } from '../hooks';

export interface CropperImageProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  src?: string;
  alt?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  initialCenterSize?: 'contain' | 'cover';
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
      initialCenterSize,
      rotatable,
      scalable,
      skewable,
      translatable,
      onReady,
      ...rest
    },
    ref,
  ) => {
    const elementRef = useForwardedRef<CropperImageElement>(ref);

    // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      if (src !== undefined) el.src = src;
      if (alt !== undefined) el.alt = alt;
      if (crossOrigin !== undefined) el.crossorigin = crossOrigin;
      if (initialCenterSize !== undefined)
        el.initialCenterSize = initialCenterSize;
      if (rotatable !== undefined) el.rotatable = rotatable;
      if (scalable !== undefined) el.scalable = scalable;
      if (skewable !== undefined) el.skewable = skewable;
      if (translatable !== undefined) el.translatable = translatable;
    }, [
      src,
      alt,
      crossOrigin,
      initialCenterSize,
      rotatable,
      scalable,
      skewable,
      translatable,
    ]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
    useEffect(() => {
      const el = elementRef.current;
      if (!el || !onReady) return;
      el.$ready(() => onReady(el));
    }, [onReady]);

    return (
      // @ts-expect-error web component
      <cropper-image ref={elementRef} src={src} alt={alt} {...rest} />
    );
  },
);

CropperImage.displayName = 'CropperImage';
