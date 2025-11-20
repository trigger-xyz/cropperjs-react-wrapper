/// <reference types="vite/client" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'cropper-canvas': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: import('react').RefObject<
          import('cropperjs').CropperCanvas | null
        >;
        background?: boolean;
        disabled?: boolean;
        'scale-step'?: number;
        'theme-color'?: string;
      };
      'cropper-image': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: import('react').RefObject<
          import('cropperjs').CropperImage | null
        >;
        rotatable?: boolean;
        scalable?: boolean;
        skewable?: boolean;
        translatable?: boolean;
      };
      'cropper-shade': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: import('react').RefObject<
          import('cropperjs').CropperShade | null
        >;
        'theme-color'?: string;
      };
      'cropper-handle': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: import('react').RefObject<
          import('cropperjs').CropperHandle | null
        >;
        action?: string;
        plain?: boolean;
        'theme-color'?: string;
      };
      'cropper-selection': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: import('react').RefObject<
          import('cropperjs').CropperSelection | null
        >;
        'aspect-ratio'?: number;
        'initial-aspect-ratio'?: number;
        'initial-coverage'?: number;
        movable?: boolean;
        resizable?: boolean;
        zoomable?: boolean;
        multiple?: boolean;
        keyboard?: boolean;
        outlined?: boolean;
        precise?: boolean;
        'theme-color'?: string;
      };
      'cropper-grid': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: import('react').RefObject<import('cropperjs').CropperGrid | null>;
        columns?: number;
        rows?: number;
        bordered?: boolean;
        covered?: boolean;
        'theme-color'?: string;
      };
      'cropper-crosshair': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: import('react').RefObject<
          import('cropperjs').CropperCrosshair | null
        >;
        centered?: boolean;
        'theme-color'?: string;
      };
    }
  }
}
