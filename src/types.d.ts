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
        slottable?: boolean;
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
        alt?: string;
        crossorigin?: '' | 'anonymous' | 'use-credentials';
        decoding?: import('react').ImgHTMLAttributes<HTMLImageElement>['decoding'];
        elementtiming?: string;
        fetchpriority?: import('react').ImgHTMLAttributes<HTMLImageElement>['fetchPriority'];
        loading?: import('react').ImgHTMLAttributes<HTMLImageElement>['loading'];
        referrerpolicy?: import('react').ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
        sizes?: string;
        src?: string;
        srcset?: string;
        'initial-center-size'?: 'contain' | 'cover';
        'initial-fit'?: import('./components/CropperImage').CropperImageFit;
        'max-fit'?: import('./components/CropperImage').CropperImageFit | '';
        'min-fit'?: import('./components/CropperImage').CropperImageFit | '';
        rotatable?: boolean;
        scalable?: boolean;
        skewable?: boolean;
        slottable?: boolean;
        translatable?: boolean;
      };
      'cropper-shade': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: import('react').RefObject<
          import('cropperjs').CropperShade | null
        >;
        slottable?: boolean;
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
        slottable?: boolean;
        'theme-color'?: string;
      };
      'cropper-selection': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: import('react').RefObject<
          import('cropperjs').CropperSelection | null
        >;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        active?: boolean;
        'aspect-ratio'?: number;
        dynamic?: boolean;
        'initial-aspect-ratio'?: number;
        'initial-coverage'?: number;
        movable?: boolean;
        resizable?: boolean;
        zoomable?: boolean;
        multiple?: boolean;
        keyboard?: boolean;
        outlined?: boolean;
        precise?: boolean;
        slottable?: boolean;
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
        slottable?: boolean;
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
        slottable?: boolean;
        'theme-color'?: string;
      };
      'cropper-viewer': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: import('react').RefObject<
          import('cropperjs').CropperViewer | null
        >;
        resize?: string;
        selection?: string;
        slottable?: boolean;
        'theme-color'?: string;
      };
    }
  }
}

export {};
