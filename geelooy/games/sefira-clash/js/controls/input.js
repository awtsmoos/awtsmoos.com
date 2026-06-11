import { keyboard } from './keyboard.js';
import { touchJoystick } from './touchJoystick.js';
import { touchButtons } from './touchButtons.js';

/**
 * B"H
 * Merges desktop and mobile into one input soul.
 *
 * Chapter 71: every consumer receives the full shape: x, y, down, jump,
 * punch, kick, grab, shield, special. No system is left guessing whether down
 * exists, so fast-fall and short-hop stop becoming ghosts.
 */
export function createInput(doc) {
  const touch = { x: 0, y: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false };
  const readKeys = keyboard(doc);
  touchJoystick(doc, touch);
  touchButtons(doc, touch);
  return { read() { return merge(readKeys(), touch); } };
}

function merge(keys, touch) {
  const down = !!touch.down || !!keys.down;
  const y = touch.y || keys.y || (down ? 1 : 0);
  return {
    x: touch.x || keys.x || 0, y, down,
    jump: !!touch.jump || !!keys.jump,
    punch: !!touch.punch || !!keys.punch,
    kick: !!touch.kick || !!keys.kick,
    grab: !!touch.grab || !!keys.grab,
    shield: !!touch.shield || !!keys.shield,
    special: !!touch.special || !!keys.special
  };
}
