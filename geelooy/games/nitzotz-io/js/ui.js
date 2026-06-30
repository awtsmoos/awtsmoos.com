// B"H
import { cacheDom } from './ui/dom.js';
import { bindOverlay } from './ui/overlay.js';
import { renderUI } from './ui/render.js';
import { bindToggles } from './ui/toggles.js';

/** Bind all UI gates and return the per-frame UI renderer. */
export function bindUI(world, actions) {
  const dom = cacheDom();
  bindOverlay(world, dom, actions);
  bindToggles(world, dom);
  return () => renderUI(world, dom);
}
