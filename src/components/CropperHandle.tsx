import type { CropperHandle as CropperHandleElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

export interface CropperHandleProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  action: string;
  plain?: boolean;
  themeColor?: string;
}

export const CropperHandle = forwardRef<
  CropperHandleElement,
  CropperHandleProps
>(({ action, plain, themeColor, ...rest }, ref) => {
  const elementRef = useRef<CropperHandleElement>(null);

  useImperativeHandle(
    ref,
    () => elementRef.current as CropperHandleElement,
    [],
  );

  // Update props
  useEffect(() => {
    if (!elementRef.current) return;
    const element = elementRef.current;

    if (action !== undefined) element.action = action;
    if (plain !== undefined) element.plain = plain;
    if (themeColor !== undefined) element.themeColor = themeColor;
  }, [action, plain, themeColor]);

  return (
    // @ts-expect-error
    <cropper-handle ref={elementRef} {...rest} />
  );
});
