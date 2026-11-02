import { after } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
});
for (const name of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLImageElement',
  'customElements',
  'Image',
  'CustomEvent',
  'Event',
  'MouseEvent',
  'Node',
  'Element',
] as const) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value: dom.window[name],
  });
}
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true });
after(() => dom.window.close());
