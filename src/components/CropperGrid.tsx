import type { CropperGrid as CropperGridElement } from 'cropperjs';
import {
  type DetailedHTMLProps,
  forwardRef,
  type HTMLAttributes,
  useEffect,
} from 'react';
import { useForwardedRef } from '../hooks';

export interface CropperGridProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  columns?: number;
  rows?: number;
  bordered?: boolean;
  covered?: boolean;
  slottable?: boolean;
  themeColor?: string;
}

export const CropperGrid = forwardRef<CropperGridElement, CropperGridProps>(
  ({ columns, rows, bordered, covered, themeColor, ...rest }, ref) => {
    const elementRef = useForwardedRef<CropperGridElement>(ref);

    // biome-ignore lint/correctness/useExhaustiveDependencies: ref is stable after mount
    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      if (columns !== undefined) el.columns = columns;
      if (rows !== undefined) el.rows = rows;
      if (bordered !== undefined) el.bordered = bordered;
      if (covered !== undefined) el.covered = covered;
      if (themeColor !== undefined) el.themeColor = themeColor;
    }, [columns, rows, bordered, covered, themeColor]);

    return (
      // @ts-expect-error web component
      <cropper-grid ref={elementRef} {...rest} />
    );
  },
);

CropperGrid.displayName = 'CropperGrid';
