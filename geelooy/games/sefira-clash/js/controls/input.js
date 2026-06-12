import { keyboard } from './keyboard.js';
import { touchJoystick } from './touchJoystick.js';
import { touchButtons } from './touchButtons.js';

/**
 * B"H
 * Merges desktop and mobile into one input soul with true analog aim.
 *
 * Chapter 277: movement and aim are related but no longer identical prisoners.
 * The left joystick may move, drop, jump, and also preserve the exact attack
 * direction for punch and kick release.
 */
export function createInput(doc) {
  preventMobileSelection(doc);
  const touch = { x: 0, y: 0, aimX: 0, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false };
  const readKeys = keyboard(doc);
  touchJoystick(doc, touch);
  touchButtons(doc, touch);
  return { read() { return merge(readKeys(), touch); } };
}

function merge(keys, touch) {
  const x = touch.x || keys.x || 0;
  const y = touch.y || keys.y || 0;
  const aimX = touch.aimX || keys.aimX || keys.x || x || 0;
  const aimY = touch.aimY || keys.aimY || keys.y || y || 0;
  const down = !!touch.down || !!keys.down || aimY > 0.52;
  return {
    x,
    y: down && !y ? 1 : y,
    down,
    aimX,
    aimY,
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
