import type {
  CropperCanvas as CropperCanvasElement,
  CropperImage as CropperImageElement,
  CropperSelection as CropperSelectionElement,
} from 'cropperjs';
import {
  type CropperActionEvent,
  CropperCanvas,
  CropperCrosshair,
  CropperGrid,
  CropperHandle,
  CropperImage,
  type CropperImageChangeEvent,
  type CropperImageFit,
  CropperSelection,
  CropperShade,
} from 'cropperjs-react-wrapper';
import { useEffect, useRef, useState } from 'react';
import image1 from '../assets/image1.png';
import image2 from '../assets/image2.png';

const FIT_OPTIONS: CropperImageFit[] = [
  'contain',
  'cover',
  'fill',
  'scale-down',
  'none',
];

type FitConstraint = CropperImageFit | '';

const App = () => {
  const cropperRef = useRef<CropperCanvasElement>(null);
  const imageRef = useRef<CropperImageElement>(null);
  const selectionRef = useRef<CropperSelectionElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image state
  const [imgSrc, setImgSrc] = useState(image1);
  const [croppedImage, setCroppedImage] = useState<string | undefined>();
  const [livePreview, setLivePreview] = useState<string | undefined>();

  // Canvas controls
  const [canvasBackground, setCanvasBackground] = useState(true);
  const [canvasDisabled, setCanvasDisabled] = useState(false);

  // Image transformation controls (track flip state)
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [initialFit, setInitialFit] = useState<CropperImageFit>('contain');
  const [maxFit, setMaxFit] = useState<FitConstraint>('');
  const [minFit, setMinFit] = useState<FitConstraint>('');
  const [lastCenterFit, setLastCenterFit] =
    useState<CropperImageFit>('contain');

  // Selection controls
  const [showShade, setShowShade] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [themeColor, setThemeColor] = useState('#3399ff');
  const [movable, setMovable] = useState(true);
  const [resizable, setResizable] = useState(true);
  const [zoomable, setZoomable] = useState(true);

  // Grid controls
  const [gridRows, setGridRows] = useState(3);
  const [gridColumns, setGridColumns] = useState(3);

  // Event controls and diagnostics
  const [preventCanvasActions, setPreventCanvasActions] = useState(false);
  const [preventImageChanges, setPreventImageChanges] = useState(false);
  const [actionEvent, setActionEvent] = useState<{
    action: string;
    scale?: number;
    rotate?: number;
    centerX?: number;
    centerY?: number;
    prevented: boolean;
  } | null>(null);
  const [imageChangeEvent, setImageChangeEvent] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    prevented: boolean;
  } | null>(null);
  const [imageChangeCount, setImageChangeCount] = useState(0);

  // Export controls
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>(
    'png',
  );
  const [exportQuality, setExportQuality] = useState(0.92);
  const [cropData, setCropData] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<
    'basic' | 'transform' | 'behavior' | 'events' | 'export'
  >('basic');

  const updateLivePreview = async () => {
    const selection = selectionRef.current;
    if (selection && selection.width > 0 && selection.height > 0) {
      const canvas = await selection.$toCanvas();
      setLivePreview(canvas.toDataURL());
    } else {
      setLivePreview(undefined);
    }
  };

  const onCrop = () => {
    updateLivePreview();
    const selection = selectionRef.current;
    if (selection && selection.width > 0 && selection.height > 0) {
      setCropData({
        x: Math.round(selection.x),
        y: Math.round(selection.y),
        width: Math.round(selection.width),
        height: Math.round(selection.height),
      });
    } else {
      setCropData(null);
    }
  };

  const handleGetResult = async () => {
    const selection = selectionRef.current;
    if (selection) {
      const canvas = await selection.$toCanvas();
      const mimeType = `image/${exportFormat}`;
      const dataUrl = canvas.toDataURL(mimeType, exportQuality);
      setCroppedImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setImgSrc(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotate = (degrees: number) => {
    const image = imageRef.current;
    if (image) {
      image.$rotate(`${degrees}deg`);
    }
  };

  const handleFlipHorizontal = () => {
    setScaleX((prev) => prev * -1);
  };

  const handleFlipVertical = () => {
    setScaleY((prev) => prev * -1);
  };

  const handleZoom = (delta: number) => {
    const image = imageRef.current;
    if (image) {
      image.$zoom(delta);
    }
  };

  const handleCenter = (fit: CropperImageFit) => {
    imageRef.current?.$resetTransform().$center(fit);
    setScaleX(1);
    setScaleY(1);
    setLastCenterFit(fit);
  };

  const resetFlipState = () => {
    setScaleX(1);
    setScaleY(1);
  };

  const handleInitialFitChange = (fit: CropperImageFit) => {
    setInitialFit(fit);
    setLastCenterFit(fit);
    resetFlipState();
  };

  const handleMinFitChange = (fit: FitConstraint) => {
    setMinFit(fit);
    resetFlipState();
  };

  const handleMaxFitChange = (fit: FitConstraint) => {
    setMaxFit(fit);
    resetFlipState();
  };

  const handleImageChange = (event: CropperImageChangeEvent) => {
    if (preventImageChanges) {
      event.preventDefault();
    }
    setImageChangeCount((count) => count + 1);
    setImageChangeEvent({
      ...event.detail,
      prevented: preventImageChanges,
    });
  };

  const handleCanvasAction = (event: CropperActionEvent) => {
    if (preventCanvasActions) {
      event.preventDefault();
    }
    const { action, scale, rotate, centerX, centerY } = event.detail;
    setActionEvent({
      action,
      scale,
      rotate,
      centerX,
      centerY,
      prevented: preventCanvasActions,
    });
  };

  const formatEventNumber = (value: number | undefined) =>
    value === undefined ? '—' : value.toFixed(2);

  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      image.$scale(scaleX, scaleY);
    }
  }, [scaleX, scaleY]);

  const handleResetTransformations = () => {
    const image = imageRef.current;
    if (image) {
      image.$resetTransform();
      setScaleX(1);
      setScaleY(1);
    }
  };

  const applyPreset = (preset: 'profile' | 'banner' | 'thumbnail') => {
    switch (preset) {
      case 'profile':
        setAspectRatio(1);
        break;
      case 'banner':
        setAspectRatio(16 / 9);
        break;
      case 'thumbnail':
        setAspectRatio(4 / 3);
        break;
    }
  };

  const downloadImage = async () => {
    if (!livePreview) return;

    try {
      const response = await fetch(livePreview);
      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cropped-image-${Date.now()}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>CropperJS-React-Wrapper Demo</h1>

        <div className="cropper-wrapper">
          <div className="cropper-container">
            <CropperCanvas
              style={{ height: '400px' }}
              ref={cropperRef}
              background={canvasBackground}
              disabled={canvasDisabled}
              themeColor={themeColor}
              onAction={handleCanvasAction}
            >
              <CropperImage
                key={`${initialFit}:${minFit}:${maxFit}`}
                ref={imageRef}
                src={imgSrc}
                alt="Picture"
                initialFit={initialFit}
                maxFit={maxFit}
                minFit={minFit}
                rotatable={true}
                scalable={true}
                skewable={true}
                translatable={true}
                onChange={handleImageChange}
              />
              {showShade && <CropperShade themeColor={themeColor} />}
              <CropperHandle action="select" plain />
              <CropperSelection
                ref={selectionRef}
                initialAspectRatio={1}
                aspectRatio={aspectRatio}
                movable={movable}
                resizable={resizable}
                zoomable={zoomable}
                keyboard={true}
                outlined={true}
                bounded={true}
                onChange={onCrop}
                themeColor={themeColor}
              >
                {showGrid && (
                  <CropperGrid
                    rows={gridRows}
                    columns={gridColumns}
                    bordered
                    covered
                    themeColor={themeColor}
                  />
                )}
                {showCrosshair && (
                  <CropperCrosshair centered themeColor={themeColor} />
                )}
                <CropperHandle
                  action="move"
                  themeColor="rgba(255, 255, 255, 0.35)"
                />
                <CropperHandle action="n-resize" themeColor={themeColor} />
                <CropperHandle action="e-resize" themeColor={themeColor} />
                <CropperHandle action="s-resize" themeColor={themeColor} />
                <CropperHandle action="w-resize" themeColor={themeColor} />
                <CropperHandle action="ne-resize" themeColor={themeColor} />
                <CropperHandle action="nw-resize" themeColor={themeColor} />
                <CropperHandle action="se-resize" themeColor={themeColor} />
                <CropperHandle action="sw-resize" themeColor={themeColor} />
              </CropperSelection>
            </CropperCanvas>
          </div>

          <div className="live-preview-section">
            <h3>Live Preview</h3>
            {livePreview ? (
              <div>
                <img
                  src={livePreview}
                  alt="Live Preview"
                  className="live-preview-image"
                />
                <button
                  type="button"
                  onClick={downloadImage}
                  className="primary"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  Download Image
                </button>
              </div>
            ) : (
              <p className="preview-placeholder">
                Create or resize a selection to see the result.
              </p>
            )}
            {cropData && (
              <div className="crop-data">
                <div>X: {cropData.x}</div>
                <div>Y: {cropData.y}</div>
                <div>Width: {cropData.width}</div>
                <div>Height: {cropData.height}</div>
              </div>
            )}
          </div>
        </div>

        <div className="param-section">
          <div className="tabs">
            <button
              type="button"
              className={activeTab === 'basic' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('basic')}
            >
              Basic Controls
            </button>
            <button
              type="button"
              className={activeTab === 'transform' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('transform')}
            >
              Transformations
            </button>
            <button
              type="button"
              className={activeTab === 'behavior' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('behavior')}
            >
              Behavior
            </button>
            <button
              type="button"
              className={activeTab === 'events' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('events')}
            >
              Events
            </button>
            <button
              type="button"
              className={activeTab === 'export' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('export')}
            >
              Export
            </button>
          </div>

          <div className="controls">
            {activeTab === 'basic' && (
              <>
                <div className="control-section">
                  <h3>Image Source</h3>
                  <div className="control-group">
                    <button type="button" onClick={() => setImgSrc(image1)}>
                      Image 1
                    </button>
                    <button type="button" onClick={() => setImgSrc(image2)}>
                      Image 2
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                <div className="control-section">
                  <h3>Selection Options</h3>
                  <div className="control-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={showShade}
                        onChange={(e) => setShowShade(e.target.checked)}
                      />
                      Show Shade
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                      />
                      Show Grid
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={showCrosshair}
                        onChange={(e) => setShowCrosshair(e.target.checked)}
                      />
                      Show Crosshair
                    </label>
                  </div>
                  <div className="control-group">
                    <label>
                      Aspect Ratio:
                      <select
                        value={aspectRatio ?? 'free'}
                        onChange={(e) =>
                          setAspectRatio(
                            e.target.value === 'free'
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      >
                        <option value={16 / 9}>16:9 (Landscape)</option>
                        <option value={4 / 3}>4:3</option>
                        <option value={1}>1:1 (Square)</option>
                        <option value={3 / 4}>3:4 (Portrait)</option>
                        <option value={9 / 16}>9:16 (Story)</option>
                        <option value="free">Free</option>
                      </select>
                    </label>
                    <label>
                      Theme Color:
                      <input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Selection Presets</h3>
                  <p className="control-description">
                    Apply a common aspect ratio to the crop selection. These
                    presets change the selection shape, not the displayed image.
                  </p>
                  <div className="control-group">
                    <button
                      type="button"
                      onClick={() => applyPreset('profile')}
                    >
                      Square Selection (1:1)
                    </button>
                    <button type="button" onClick={() => applyPreset('banner')}>
                      Banner Selection (16:9)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('thumbnail')}
                    >
                      Thumbnail Selection (4:3)
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'transform' && (
              <>
                <div className="control-section">
                  <h3>Fit &amp; Center</h3>
                  <p className="control-description">
                    Choose the automatic image fit and optional zoom limits. The
                    three settings are initialized together; center commands
                    apply immediately and respect the active limits.
                  </p>
                  <div className="control-group">
                    <label>
                      Initial fit:
                      <select
                        value={initialFit}
                        onChange={(event) =>
                          handleInitialFitChange(
                            event.target.value as CropperImageFit,
                          )
                        }
                      >
                        {FIT_OPTIONS.map((fit) => (
                          <option key={fit} value={fit}>
                            {fit}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Minimum fit:
                      <select
                        value={minFit}
                        onChange={(event) =>
                          handleMinFitChange(
                            event.target.value as FitConstraint,
                          )
                        }
                      >
                        <option value="">Unrestricted</option>
                        {FIT_OPTIONS.map((fit) => (
                          <option key={fit} value={fit}>
                            {fit}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Maximum fit:
                      <select
                        value={maxFit}
                        onChange={(event) =>
                          handleMaxFitChange(
                            event.target.value as FitConstraint,
                          )
                        }
                      >
                        <option value="">Unrestricted</option>
                        {FIT_OPTIONS.map((fit) => (
                          <option key={fit} value={fit}>
                            {fit}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="control-group fit-buttons">
                    {FIT_OPTIONS.map((fit) => (
                      <button
                        key={fit}
                        type="button"
                        className={lastCenterFit === fit ? 'selected' : ''}
                        aria-pressed={lastCenterFit === fit}
                        onClick={() => handleCenter(fit)}
                      >
                        Center: {fit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-section">
                  <h3>Rotation</h3>
                  <div className="control-group">
                    <button type="button" onClick={() => handleRotate(90)}>
                      Rotate 90° CW
                    </button>
                    <button type="button" onClick={() => handleRotate(-90)}>
                      Rotate 90° CCW
                    </button>
                    <button type="button" onClick={() => handleRotate(180)}>
                      Rotate 180°
                    </button>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Flip</h3>
                  <div className="control-group">
                    <button type="button" onClick={handleFlipHorizontal}>
                      Flip Horizontal
                    </button>
                    <button type="button" onClick={handleFlipVertical}>
                      Flip Vertical
                    </button>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Zoom</h3>
                  <div className="control-group">
                    <button type="button" onClick={() => handleZoom(0.1)}>
                      Zoom In (+)
                    </button>
                    <button type="button" onClick={() => handleZoom(-0.1)}>
                      Zoom Out (-)
                    </button>
                    <button type="button" onClick={handleResetTransformations}>
                      Reset Transformations
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'behavior' && (
              <>
                <div className="control-section">
                  <h3>Canvas Options</h3>
                  <div className="control-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={canvasBackground}
                        onChange={(e) => setCanvasBackground(e.target.checked)}
                      />
                      Show Background
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={canvasDisabled}
                        onChange={(e) => setCanvasDisabled(e.target.checked)}
                      />
                      Disable Canvas
                    </label>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Selection Behavior</h3>
                  <div className="control-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={movable}
                        onChange={(e) => setMovable(e.target.checked)}
                      />
                      Movable
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={resizable}
                        onChange={(e) => setResizable(e.target.checked)}
                      />
                      Resizable
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={zoomable}
                        onChange={(e) => setZoomable(e.target.checked)}
                      />
                      Zoomable
                    </label>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Grid Customization</h3>
                  <div className="control-group">
                    <label>
                      Rows:
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={gridRows}
                        onChange={(e) => setGridRows(Number(e.target.value))}
                      />
                    </label>
                    <label>
                      Columns:
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={gridColumns}
                        onChange={(e) => setGridColumns(Number(e.target.value))}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'events' && (
              <div className="event-sections">
                <div className="control-section">
                  <h3>Canvas Action Event</h3>
                  <p className="control-description">
                    Interact with the cropper to inspect action data.
                    Two-pointer scale and rotate gestures also report their
                    center point.
                  </p>
                  <div className="control-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={preventCanvasActions}
                        onChange={(event) =>
                          setPreventCanvasActions(event.target.checked)
                        }
                      />
                      Prevent default canvas actions
                    </label>
                  </div>
                  <dl className="event-readout">
                    <div>
                      <dt>Action</dt>
                      <dd>{actionEvent?.action ?? 'Waiting…'}</dd>
                    </div>
                    <div>
                      <dt>Scale</dt>
                      <dd>{formatEventNumber(actionEvent?.scale)}</dd>
                    </div>
                    <div>
                      <dt>Rotation</dt>
                      <dd>{formatEventNumber(actionEvent?.rotate)} rad</dd>
                    </div>
                    <div>
                      <dt>Center X</dt>
                      <dd>{formatEventNumber(actionEvent?.centerX)}</dd>
                    </div>
                    <div>
                      <dt>Center Y</dt>
                      <dd>{formatEventNumber(actionEvent?.centerY)}</dd>
                    </div>
                    <div>
                      <dt>Result</dt>
                      <dd>
                        {actionEvent
                          ? actionEvent.prevented
                            ? 'Prevented'
                            : 'Applied'
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="control-section">
                  <h3>Image Change Event</h3>
                  <p className="control-description">
                    Every proposed image transform reports its next rectangle.
                    Preventing the event keeps the current transform unchanged.
                  </p>
                  <div className="control-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={preventImageChanges}
                        onChange={(event) =>
                          setPreventImageChanges(event.target.checked)
                        }
                      />
                      Prevent image changes
                    </label>
                  </div>
                  <dl className="event-readout">
                    <div>
                      <dt>Events</dt>
                      <dd>{imageChangeCount}</dd>
                    </div>
                    <div>
                      <dt>X</dt>
                      <dd>{formatEventNumber(imageChangeEvent?.x)}</dd>
                    </div>
                    <div>
                      <dt>Y</dt>
                      <dd>{formatEventNumber(imageChangeEvent?.y)}</dd>
                    </div>
                    <div>
                      <dt>Width</dt>
                      <dd>{formatEventNumber(imageChangeEvent?.width)}</dd>
                    </div>
                    <div>
                      <dt>Height</dt>
                      <dd>{formatEventNumber(imageChangeEvent?.height)}</dd>
                    </div>
                    <div>
                      <dt>Result</dt>
                      <dd>
                        {imageChangeEvent
                          ? imageChangeEvent.prevented
                            ? 'Prevented'
                            : 'Applied'
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <>
                <div className="control-section">
                  <h3>Export Options</h3>
                  <div className="control-group">
                    <label>
                      Format:
                      <select
                        value={exportFormat}
                        onChange={(e) =>
                          setExportFormat(
                            e.target.value as 'png' | 'jpeg' | 'webp',
                          )
                        }
                      >
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="webp">WebP</option>
                      </select>
                    </label>
                    {exportFormat !== 'png' && (
                      <label>
                        Quality: {Math.round(exportQuality * 100)}%
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={exportQuality}
                          onChange={(e) =>
                            setExportQuality(Number(e.target.value))
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="control-section">
                  <h3>Generate Result</h3>
                  <div className="control-group">
                    <button type="button" onClick={onCrop}>
                      Refresh Crop Data
                    </button>
                    <button
                      type="button"
                      onClick={handleGetResult}
                      className="primary"
                    >
                      Crop Image
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {croppedImage && (
          <div className="result-section">
            <h2>Cropped Result</h2>
            <img src={croppedImage} alt="Cropped" className="preview-image" />
            <div className="control-group">
              <a href={croppedImage} download={`cropped.${exportFormat}`}>
                <button type="button">Download</button>
              </a>
            </div>
          </div>
        )}

        <div className="info-section">
          <h3>Keyboard Shortcuts</h3>
          <ul>
            <li>
              <kbd>Delete</kbd> or <kbd>⌘ + Backspace</kbd> - Remove active
              selection
            </li>
            <li>
              <kbd>←</kbd> - Move selection left by 1px
            </li>
            <li>
              <kbd>→</kbd> - Move selection right by 1px
            </li>
            <li>
              <kbd>↑</kbd> - Move selection up by 1px
            </li>
            <li>
              <kbd>↓</kbd> - Move selection down by 1px
            </li>
            <li>
              <kbd>+</kbd> - Zoom in by 10%
            </li>
            <li>
              <kbd>-</kbd> - Zoom out by 10%
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
