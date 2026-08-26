export type CropperAction =
  | 'none'
  | 'select'
  | 'move'
  | 'scale'
  | 'rotate'
  | 'transform'
  | 'n-resize'
  | 'e-resize'
  | 's-resize'
  | 'w-resize'
  | 'ne-resize'
  | 'nw-resize'
  | 'se-resize'
  | 'sw-resize'
  | (string & {});

export type CropperActionRelatedEvent =
  | PointerEvent
  | MouseEvent
  | TouchEvent
  | WheelEvent;

export interface CropperActionLifecycleEventDetail {
  action: CropperAction;
  relatedEvent: CropperActionRelatedEvent;
}

export interface CropperActionEventDetail
  extends CropperActionLifecycleEventDetail {
  /** Pointer coordinates for move, select, and resize actions. */
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  /** Scale delta for scale and transform actions. */
  scale?: number;
  /** Rotation in radians for rotate and transform actions. */
  rotate?: number;
  /** Cropper.js 2.2 transform center in page coordinates. */
  centerX?: number;
  /** Cropper.js 2.2 transform center in page coordinates. */
  centerY?: number;
}

export type CropperActionEvent = CustomEvent<CropperActionEventDetail>;
export type CropperActionStartEvent =
  CustomEvent<CropperActionLifecycleEventDetail>;
export type CropperActionMoveEvent =
  CustomEvent<CropperActionLifecycleEventDetail>;
export type CropperActionEndEvent =
  CustomEvent<CropperActionLifecycleEventDetail>;
