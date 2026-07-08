// B"H
/** @file domPanels.js @description Chapter 383: Closing panels is one shared act. */
import { hardSeal } from './domEvents.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { panelSelector, q, worker } from './domSelectors.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function closePanels(event) {
  if (event) hardSeal(event);
  document.querySelectorAll(panelSelector()).forEach(el => {
    if (el.id === 'inventoryScreen' || el.classList?.contains('store-container')) el.classList.add('hidden');
    else el.remove();
  });
}
export function send(inner) {
  const detail = { olamPeula: inner };
  q('ikar')?.dispatchEvent(new CustomEvent('olamPeula', { bubbles: true, detail }));
  worker()?.postMessage?.(detail);
}
