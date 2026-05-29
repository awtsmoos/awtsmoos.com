// B"H
/**
 * @module DomEventsUnified
 * @description Chapter 28: Fresh touch boundary imports for inventory-safe mobile UI.
 */
import KeyboardEmissary from './input/KeyboardEmissary.js';
import MouseEmissary from './input/MouseEmissary.js';
import TouchOrchestrator from './input/TouchOrchestrator.js?v=lean-l1-20260528-bh37';

export default function setupDomEvents(manager) {
  const { eved } = manager;
  const broadcastResize = () => eved.postMessage({ resize: { width: window.innerWidth, height: window.innerHeight, devicePixelRatio: window.devicePixelRatio || 1 } });

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
