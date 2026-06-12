import { keyboard } from './keyboard.js';
import { touchJoystick } from './touchJoystick.js';
import { touchButtons } from './touchButtons.js';

/**
 * B"H
 * Merges desktop and mobile into one input soul and forbids selection ghosts.
 *
 * Chapter 134: no button may become text. The browser is commanded to stop
 * selecting, calling out, dragging, or context-menuing the battle controls.
 */
export function createInput(doc) {
  preventMobileSelection(doc);
  const touch = { x: 0, y: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false };
  const readKeys = keyboard(doc);
  touchJoystick(doc, touch);
  touchButtons(doc, touch);
  return { read() { return merge(readKeys(), touch); } };
}

function merge(keys, touch) {
  const down = !!touch.down || !!keys.down;
  const y = touch.y || keys.y || (down ? 1 : 0);
  const x = touch.x || keys.x || 0;
  return {
    x, y, down,
    aimX: x,
    aimY: y,
    jump: !!touch.jump || !!keys.jump,
    punch: !!touch.punch || !!keys.punch,
    kick: !!touch.kick || !!keys.kick,
    grab: !!touch.grab || !!keys.grab,
    shield: !!touch.shield || !!keys.shield,
    special: !!touch.special || !!keys.special
  };
}

function preventMobileSelection(doc) {
  const block = event => event.preventDefault();
  doc.addEventListener('selectstart', block, { passive: false });
  doc.addEventListener('contextmenu', block, { passive: false });
  doc.addEventListener('dragstart', block, { passive: false });
}
