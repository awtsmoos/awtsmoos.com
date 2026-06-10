// B"H
/**
 * @module DomEventsUnified
 * @description
 * Chapter 47: The DOM Bound The Steady Joystick.
 *
 * The Awtsmoos imports the touch orchestrator that sends only key-state deltas,
 * eliminating the keyup/keydown storm that made walking start choppy.
 */
import KeyboardEmissary from './input/KeyboardEmissary.js?v=npc-scroll-pass-through-20260609-bh638';
import MouseEmissary from './input/MouseEmissary.js?v=npc-scroll-pass-through-20260609-bh638';
import TouchOrchestrator from './input/TouchOrchestrator.js?v=npc-scroll-pass-through-20260609-bh638';
import { measureRenderViewport } from '../../divine_systems/render/core/PixelRatioGovernor.js';

export default function setupDomEvents(manager) {
  const { eved } = manager;
  const broadcastResize = () => {
    const sizing = measureRenderViewport(window, "resize");
    eved.postMessage({
      resize: {
        width: sizing.width,
        height: sizing.height,
        devicePixelRatio: sizing.pixelRatio,
        rawDevicePixelRatio: sizing.rawPixelRatio
      }
    });
  };
  window.addEventListener('resize', broadcastResize);
  KeyboardEmissary.bind(eved);
  MouseEmissary.bind(eved);
  TouchOrchestrator.bind(eved);
  broadcastResize();
  window.addEventListener('contextmenu', event => {
    const markers = ['button', '.mitzvahBtn', '.awtsmoosBtn', '.ctx-btn', '.characterDesigner', '.store-container', '.quest-log', '#actionBar', '#inventoryScreen', '.awtsmoosInventoryViewer'];
    if (!event.target.closest(markers.join(', '))) event.preventDefault();
  });
}
