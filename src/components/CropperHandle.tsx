import type { CropperHandle as CropperHandleElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
} from 'react';
import { useForwardedRef } from '../hooks';

export interface CropperHandleProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  action: string;
  plain?: boolean;
  slottable?: boolean;
  themeColor?: string;
}

export const CropperHandle = forwardRef<
  CropperHandleElement,
  CropperHandleProps
>(({ action, plain, themeColor, ...rest }, ref) => {
  const elementRef = useForwardedRef<CropperHandleElement>(ref);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    if (action !== undefined) el.action = action;
    if (plain !== undefined) el.plain = plain;
    if (themeColor !== undefined) el.themeColor = themeColor;
  }, [action, plain, themeColor]);

  return (
    // @ts-expect-error web component
    <cropper-handle ref={elementRef} {...rest} />
  );
});

CropperHandle.displayName = 'CropperHandle';
