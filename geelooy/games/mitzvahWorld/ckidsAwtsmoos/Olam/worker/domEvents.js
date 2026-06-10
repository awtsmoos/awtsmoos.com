// B"H
/**
 * @module DomEventsUnified
 * @description
 * Chapter 49: The DOM binds the wall-direct mobile movement seal.
 */
import KeyboardEmissary from './input/KeyboardEmissary.js?v=npc-scroll-pass-through-20260609-bh638';
import MouseEmissary from './input/MouseEmissary.js?v=npc-scroll-pass-through-20260609-bh638';
import TouchOrchestrator from './input/TouchOrchestrator.js?v=wall-direct-mobile-move-20260610-bh705';
import { measureRenderViewport } from '../../divine_systems/render/core/PixelRatioGovernor.js';

export default function setupDomEvents(manager) {
  const { eved } = manager;
  const broadcastResize = () => {
    const sizing = measureRenderViewport(window, "resize");
    eved.postMessage({ resize: { width: sizing.width, height: sizing.height, devicePixelRatio: sizing.pixelRatio, rawDevicePixelRatio: sizing.rawPixelRatio } });
  };
  window.addEventListener('resize', broadcastResize);
  KeyboardEmissary.bind(eved);
  MouseEmissary.bind(eved);
  TouchOrchestrator.bind(eved);
  console.info('B"H | DOM_EVENTS_BOUND', { seal: 'wall-direct-mobile-move-20260610-bh705', touch: 'ontouchstart' in window, pointer: 'onpointerdown' in window, maxTouchPoints: navigator.maxTouchPoints || 0, touchTrace: window.__AWTSMOOS_TOUCH_TRACE__?.slice?.(-3) || [] });
  broadcastResize();
  window.addEventListener('contextmenu', event => {
    const markers = ['button', '.mitzvahBtn', '.awtsmoosBtn', '.ctx-btn', '.characterDesigner', '.store-container', '.quest-log', '#actionBar', '#inventoryScreen', '.awtsmoosInventoryViewer'];
    if (!event.target.closest(markers.join(', '))) event.preventDefault();
  });
}
