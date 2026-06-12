import { keyboard } from './keyboard.js';
import { mouseCombat, drainMouse } from './mouseCombat.js';
import { touchJoystick } from './touchJoystick.js';
import { touchButtons } from './touchButtons.js';
import { tickTouchAim } from './touchAimMemory.js';

/**
 * B"H
 * Unified input with Android remembered aim.
 *
 * Chapter 53: when the joystick rests, the last angle still burns. Utility
 * buttons join punch and kick, giving the phone a complete combat vocabulary.
 */
export function createInput(doc, options = {}) {
  preventMobileSelection(doc);
  const touch = blank(), mouse = blank(), readKeys = keyboard(doc);
  touchJoystick(doc, touch);
  touchButtons(doc, touch);
  mouseCombat(doc, mouse, options);
  return { read() { return merge(readKeys(), touch, drainMouse(mouse)); } };
}

function blank() {
  return { x: 0, y: 0, aimX: 0, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false };
}

function merge(keys, touch, mouse) {
  const memory = tickTouchAim(touch);
  const x = touch.x || keys.x || 0;
  const y = touch.y || keys.y || 0;
  const aimX = mouse.aimX || touch.aimX || memory.aimX || keys.aimX || keys.x || x || 0;
  const aimY = mouse.aimY || touch.aimY || memory.aimY || keys.aimY || keys.y || y || 0;
  const down = !!touch.down || !!keys.down || aimY > 0.52;
  return {
    x, y: down && !y ? 1 : y, down, aimX, aimY,
    jump: !!touch.jump || !!keys.jump,
    punch: !!mouse.punch || !!touch.punch || !!keys.punch,
    kick: !!mouse.kick || !!touch.kick || !!keys.kick,
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
