// B"H
/** @module DomEventsUnified @description Keyboard, mouse, and real multi-touch input binding. */
import KeyboardEmissary from './input/KeyboardEmissary.js?v=npc-scroll-pass-through-20260609-bh638';
import MouseEmissary from './input/MouseEmissary.js?v=npc-scroll-pass-through-20260609-bh638';
import TouchOrchestrator from './input/TouchOrchestrator.js?v=multi-touch-joystick-camera-20260702-bh6';
import { measureRenderViewport } from '../../divine_systems/render/core/PixelRatioGovernor.js?v=native-crisp-20260622-bh1';
const SEAL = 'dom-events-multitouch-20260702-bh6';
export default function setupDomEvents(manager) {
  const { eved } = manager;
  const broadcastResize = () => {
    const s = measureRenderViewport(window, "resize");
    eved.postMessage({ resize:{ width:s.width, height:s.height, devicePixelRatio:s.pixelRatio, rawDevicePixelRatio:s.rawPixelRatio, quality:s.quality } });
  };
  window.addEventListener('resize', broadcastResize);
  KeyboardEmissary.bind(eved); MouseEmissary.bind(eved); TouchOrchestrator.bind(eved);
  if (window.__AWTSMOOS_INPUT_TRACE__ === true) console.info('B"H | DOM_EVENTS_BOUND', { seal:SEAL, touch:'ontouchstart' in window, pointer:'onpointerdown' in window, maxTouchPoints:navigator.maxTouchPoints || 0, touchTrace:window.__AWTSMOOS_TOUCH_TRACE__?.slice?.(-3) || [] });
  broadcastResize();
  window.addEventListener('contextmenu', event => {
    const markers = ['button','.mitzvahBtn','.awtsmoosBtn','.ctx-btn','.characterDesigner','.store-container','.quest-log','#actionBar','#inventoryScreen','.awtsmoosInventoryViewer','#awtsMobileSettings','#awtsMobileSettingsGear'];
    if (!event.target.closest(markers.join(', '))) event.preventDefault();
  });
}
