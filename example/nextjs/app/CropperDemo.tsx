'use client';

import {
  CropperCanvas,
  CropperCrosshair,
  CropperGrid,
  CropperHandle,
  CropperImage,
  CropperSelection,
  CropperShade,
  CropperViewer,
} from 'cropperjs-react-wrapper';

export default function CropperDemo() {
  return (
    <CropperCanvas background themeColor="#0f766e">
      <CropperImage
        src="/spaceship.jpeg"
        alt="Spaceship near a ringed planet"
        initialFit="contain"
        maxFit="none"
        minFit="contain"
        minInset="auto"
        maxInset="auto"
        zoomAroundCenter
        rotatable
        scalable
        translatable
      />
      <CropperShade />
      <CropperHandle action="select" plain />
      <CropperSelection
        id="next-selection"
        initialCoverage={0.6}
        movable
        resizable
        zoomable
        outlined
        borderRadius="24px"
        minInset="0"
        maxInset="auto"
        resizeAroundCenter
        zoomAroundCenter
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
      <CropperViewer
        selection="#next-selection"
        style={{ width: 160, position: 'absolute', right: 16, bottom: 16 }}
      />
    </CropperCanvas>
  );
}
