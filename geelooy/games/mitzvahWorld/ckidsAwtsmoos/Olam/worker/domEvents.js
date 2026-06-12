// B"H
/**
 * @module DomEventsUnified
 * @description
 * Chapter 426: The DOM binds the rooted touch covenant.
 *
 * The Awtsmoos gathers resize, keyboard, mouse, touch, and pointer rivers at
 * this gate before they enter the worker. The seal now matches the player-root
 * guarantee so input traces and body traces speak one version of truth.
 */
import KeyboardEmissary from './input/KeyboardEmissary.js?v=npc-scroll-pass-through-20260609-bh638';
import MouseEmissary from './input/MouseEmissary.js?v=npc-scroll-pass-through-20260609-bh638';
import TouchOrchestrator from './input/TouchOrchestrator.js?v=village-polish-20260612-bh811';
import { measureRenderViewport } from '../../divine_systems/render/core/PixelRatioGovernor.js';

const SEAL = 'visible-root-binding-20260610-bh710';

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
  if (window.__AWTSMOOS_INPUT_TRACE__ === true) console.info('B"H | DOM_EVENTS_BOUND', { seal: SEAL, touch: 'ontouchstart' in window, pointer: 'onpointerdown' in window, maxTouchPoints: navigator.maxTouchPoints || 0, touchTrace: window.__AWTSMOOS_TOUCH_TRACE__?.slice?.(-3) || [] });
  broadcastResize();
  window.addEventListener('contextmenu', event => {
    const markers = ['button', '.mitzvahBtn', '.awtsmoosBtn', '.ctx-btn', '.characterDesigner', '.store-container', '.quest-log', '#actionBar', '#inventoryScreen', '.awtsmoosInventoryViewer'];
    if (!event.target.closest(markers.join(', '))) event.preventDefault();
  });
}
