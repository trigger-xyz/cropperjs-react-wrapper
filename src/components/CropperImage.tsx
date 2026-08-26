import type { CropperImage as CropperImageElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  useEffect,
} from 'react';
import { useCustomEvents, useForwardedRef } from '../hooks';

export type CropperImageFit =
  | 'contain'
  | 'cover'
  | 'fill'
  | 'none'
  | 'scale-down';

export interface CropperImageChangeEventDetail {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CropperImageChangeEvent =
  CustomEvent<CropperImageChangeEventDetail>;

export interface CropperImageProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>,
    'onChange'
  > {
  src?: string;
  alt?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  decoding?: ImgHTMLAttributes<HTMLImageElement>['decoding'];
  elementTiming?: string;
  fetchPriority?: ImgHTMLAttributes<HTMLImageElement>['fetchPriority'];
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
  sizes?: string;
  srcSet?: string;
  /** @deprecated Since Cropper.js 2.2.0. Use `initialFit` instead. */
  initialCenterSize?: 'contain' | 'cover';
  initialFit?: CropperImageFit;
  maxFit?: CropperImageFit | '';
  minFit?: CropperImageFit | '';
  rotatable?: boolean;
  scalable?: boolean;
  skewable?: boolean;
  slottable?: boolean;
  translatable?: boolean;
  onReady?: (image: CropperImageElement) => void;
  onChange?: (event: CropperImageChangeEvent) => void;
}

export const CropperImage = forwardRef<CropperImageElement, CropperImageProps>(
  (
    {
      src,
      alt,
      crossOrigin,
      decoding,
      elementTiming,
      fetchPriority,
      loading,
      referrerPolicy,
      sizes,
      srcSet,
      initialCenterSize,
      initialFit,
      maxFit,
      minFit,
      rotatable,
      scalable,
      skewable,
      translatable,
      onReady,
      onChange,
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
      if (decoding !== undefined) el.decoding = decoding;
      if (elementTiming !== undefined) el.elementtiming = elementTiming;
      if (fetchPriority !== undefined) el.fetchpriority = fetchPriority;
      if (loading !== undefined) el.loading = loading;
      if (referrerPolicy !== undefined) el.referrerpolicy = referrerPolicy;
      if (sizes !== undefined) el.sizes = sizes;
      if (srcSet !== undefined) el.srcset = srcSet;
      if (initialCenterSize !== undefined)
        el.initialCenterSize = initialCenterSize;
      if (initialFit !== undefined) el.initialFit = initialFit;
      if (maxFit !== undefined) el.maxFit = maxFit;
      if (minFit !== undefined) el.minFit = minFit;
      if (rotatable !== undefined) el.rotatable = rotatable;
      if (scalable !== undefined) el.scalable = scalable;
      if (skewable !== undefined) el.skewable = skewable;
      if (translatable !== undefined) el.translatable = translatable;
    }, [
      src,
      alt,
      crossOrigin,
      decoding,
      elementTiming,
      fetchPriority,
      loading,
      referrerPolicy,
      sizes,
      srcSet,
      initialCenterSize,
      initialFit,
      maxFit,
      minFit,
      rotatable,
      scalable,
      skewable,
      translatable,
    ]);

    useCustomEvents(elementRef, {
      change: onChange,
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
    useEffect(() => {
      const el = elementRef.current;
      if (!el || !onReady) return;
      el.$ready(() => onReady(el));
    }, [onReady]);

    return (
      // @ts-expect-error web component
      <cropper-image
        ref={elementRef}
        src={src}
        alt={alt}
        crossOrigin={crossOrigin}
        decoding={decoding}
        elementTiming={elementTiming}
        fetchPriority={fetchPriority}
        loading={loading}
        referrerPolicy={referrerPolicy}
        sizes={sizes}
        srcSet={srcSet}
        initial-center-size={initialCenterSize}
        initial-fit={initialFit}
        max-fit={maxFit}
        min-fit={minFit}
        {...rest}
      />
    );
  },
);

CropperImage.displayName = 'CropperImage';
