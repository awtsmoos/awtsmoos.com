// B"H
/**
 * @file domEvents.js
 * @description Chapter 563: UI glass lets its own buttons breathe.
 * The previous seal caught events on the overlay root during capture, so the
 * button below never received the click. Now controls are bound directly, while
 * non-control overlay taps are swallowed to protect the world behind the card.
 */
export function hardSeal(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
}
export function softSeal(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
}
export function bindPress(el, fn) {
  if (!el) return;
  let last = 0;
  const run = event => {
    hardSeal(event);
    const now = performance.now();
    if (now - last < 260) return;
    last = now;
    fn(event);
  };
  ['pointerup', 'touchend', 'click'].forEach(type => el.addEventListener(type, run, false));
}
function isControl(target) {
  return Boolean(target?.closest?.('button,[data-awts-action],[data-level-id],[data-npc-close],[data-npc-choose],[data-npc-buy],[data-npc-sell],[data-npc-travel],input,select,textarea,a'));
}
export function sealIsland(root) {
  if (!root) return;
  root.style.pointerEvents = 'auto';
  root.setAttribute('data-awts-ui-seal', 'true');
  const guard = event => {
    if (isControl(event.target)) return;
    softSeal(event);
  };
  ['pointerdown', 'mousedown', 'touchstart'].forEach(type => root.addEventListener(type, guard, true));
  ['pointerup', 'mouseup', 'click', 'touchend'].forEach(type => root.addEventListener(type, guard, false));
}
