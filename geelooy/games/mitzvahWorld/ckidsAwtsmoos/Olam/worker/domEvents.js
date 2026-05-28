// B"H
/**
 * @module DomEventsUnified
 * @description
 * Chapter 16: Keyboard, mouse, and bh20 touch enter through one bridge.
 *
 * The Awtsmoos makes a single gate for the senses: resize, keys, desktop mouse,
 * and the corrected mobile TouchOrchestrator that understands joystick stride,
 * open-screen rotation, and pinch without confusing UI vessels for desert sky.
 */
import KeyboardEmissary from './input/KeyboardEmissary.js';
import MouseEmissary from './input/MouseEmissary.js';
import TouchOrchestrator from './input/TouchOrchestrator.js?v=lean-l1-20260528-bh23';

export default function setupDomEvents(manager) {
  const { eved } = manager;

  const broadcastResize = () => {
    eved.postMessage({ resize: { width: window.innerWidth, height: window.innerHeight, devicePixelRatio: window.devicePixelRatio || 1 } });
  };

  window.addEventListener('resize', broadcastResize);
  KeyboardEmissary.bind(eved);
  MouseEmissary.bind(eved);
  TouchOrchestrator.bind(eved);
  broadcastResize();

  window.addEventListener("contextmenu", event => {
    const markers = ['button', '.mitzvahBtn', '.awtsmoosBtn', '.ctx-btn', '.characterDesigner', '.store-container', '.quest-log'];
    if (!event.target.closest(markers.join(', '))) event.preventDefault();
  });
}
