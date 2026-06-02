'use client';

import {
  CropperCanvas,
  CropperCrosshair,
  CropperGrid,
  CropperHandle,
  CropperImage,
  CropperSelection,
} from 'cropperjs-react-wrapper';

export default function CropperDemo() {
  return (
    <CropperCanvas background themeColor="#0f766e">
      <CropperImage
        src="/spaceship.jpeg"
        alt="Spaceship near a ringed planet"
        initialCenterSize="contain"
        rotatable
        scalable
        translatable
      />
      <CropperHandle action="select" plain />
      <CropperSelection
        initialCoverage={0.6}
        movable
        resizable
        zoomable
        outlined
      >
        <CropperGrid role="grid" covered bordered />
        <CropperCrosshair centered />
        <CropperHandle action="move" themeColor="rgba(255, 255, 255, 0.35)" />
        <CropperHandle action="n-resize" />
        <CropperHandle action="e-resize" />
        <CropperHandle action="s-resize" />
        <CropperHandle action="w-resize" />
        <CropperHandle action="ne-resize" />
        <CropperHandle action="nw-resize" />
        <CropperHandle action="se-resize" />
        <CropperHandle action="sw-resize" />
      </CropperSelection>
    </CropperCanvas>
  );
}
