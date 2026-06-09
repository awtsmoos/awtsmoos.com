// B"H
/**
 * @file domEvents.js
 * @description Chapter 382: Touch and click are sealed so the player taps the
 * UI, not the world behind it.
 */
export function hardSeal(event) { event?.preventDefault?.(); event?.stopPropagation?.(); event?.stopImmediatePropagation?.(); }
export function bindPress(el, fn) {
  if (!el) return;
  let last = 0;
  const run = event => { hardSeal(event); const now = performance.now(); if (now - last < 260) return; last = now; fn(event); };
  ['pointerup', 'touchend', 'click'].forEach(type => el.addEventListener(type, run, false));
}
export function sealIsland(root) {
  ['pointerdown', 'mousedown', 'touchstart'].forEach(type => root.addEventListener(type, event => {
    if (event.target?.closest?.('button,[data-awts-action],[data-level-id]')) return;
    event.preventDefault(); event.stopPropagation();
  }, false));
}
