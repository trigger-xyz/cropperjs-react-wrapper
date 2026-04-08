import {
  type ForwardedRef,
  type RefObject,
  useImperativeHandle,
  useRef,
} from 'react';

/**
 * Manages ref forwarding for web component wrappers.
 * Creates an internal ref and exposes it via the forwarded ref.
 */
export function useForwardedRef<T extends HTMLElement>(
  ref: ForwardedRef<T>,
): RefObject<T | null> {
  const elementRef = useRef<T>(null);
  useImperativeHandle(ref, () => elementRef.current as T, []);
  return elementRef;
}
