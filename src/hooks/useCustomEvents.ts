import { type RefObject, useLayoutEffect, useRef } from 'react';

type EventHandler = (event: CustomEvent) => void;

/**
 * Manages event listener registration for web component custom events.
 * Uses a ref to always dispatch to the latest handler, avoiding
 * re-subscription when handlers change.
 */
export function useCustomEvents(
  elementRef: RefObject<HTMLElement | null>,
  events: Record<string, EventHandler | undefined>,
  options?: AddEventListenerOptions,
): void {
  const handlersRef = useRef(events);
  handlersRef.current = events;

  const eventNamesRef = useRef(Object.keys(events));
  const optionsRef = useRef(options);

  // biome-ignore lint/correctness/useExhaustiveDependencies: handlers tracked via ref, event names are stable per component
  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const names = eventNamesRef.current;
    const listener = (e: Event) => {
      handlersRef.current[e.type]?.(e as CustomEvent);
    };

    for (const name of names) {
      el.addEventListener(name, listener, optionsRef.current);
    }

    return () => {
      for (const name of names) {
        el.removeEventListener(name, listener, optionsRef.current);
      }
    };
  }, []);
}
