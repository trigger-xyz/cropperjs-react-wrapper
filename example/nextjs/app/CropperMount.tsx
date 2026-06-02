'use client';

import dynamic from 'next/dynamic';

const CropperDemo = dynamic(() => import('./CropperDemo'), {
  ssr: false,
  loading: () => <div className="cropper-loading">Loading cropper</div>,
});

export function CropperMount() {
  return <CropperDemo />;
}
