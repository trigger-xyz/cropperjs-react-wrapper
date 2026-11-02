import type { CropperImage as ImageElement } from 'cropperjs';
import * as Current from 'cropperjs-react-wrapper';
import type * as Previous from 'previous-wrapper';
import { createRef } from 'react';

// Compile existing consumer code against the installed declarations, with no
// source aliases and skipLibCheck disabled. Optional additions remain compatible.
export const runtime: typeof Previous = Current;
const imageRef = createRef<ImageElement>();
const onChange = (event: CustomEvent) => event.preventDefault();
export const example = (
  <Current.CropperCanvas background>
    <Current.CropperImage
      ref={imageRef}
      src="/photo.jpg"
      initialCenterSize="contain"
      initialFit="cover"
      minFit="contain"
      maxFit="none"
      rotatable
      scalable
      skewable
      translatable
      onReady={(image) => image.$rotate('90deg')}
    />
    <Current.CropperSelection
      initialCoverage={0.5}
      aspectRatio={1}
      movable
      resizable
      zoomable
      bounded
      onChange={onChange}
    >
      <Current.CropperHandle action="move" />
      <Current.CropperGrid bordered />
      <Current.CropperCrosshair centered />
    </Current.CropperSelection>
    <Current.CropperShade themeColor="red" />
    <Current.CropperViewer selection="#crop" resize="both" />
  </Current.CropperCanvas>
);
