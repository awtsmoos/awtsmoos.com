// B"H
import { clamp, len } from '../math.js';

/** Touch stick: one thumb opens a path through the crowd. */
export function bindStick(world) {
  const stick = document.getElementById('stick');
  const nub = stick.querySelector('i');
  const touch = { active: false };
  stick.addEventListener('pointerdown', event => start(event, stick, touch, nub, world));
  stick.addEventListener('pointermove', event => move(event, stick, nub, world));
  stick.addEventListener('pointerup', () => reset(touch, nub, world));
  stick.addEventListener('pointercancel', () => reset(touch, nub, world));
  return touch;
}

function start(event, stick, touch, nub, world) {
  touch.active = true;
  stick.setPointerCapture(event.pointerId);
  move(event, stick, nub, world);
}

function move(event, stick, nub, world) {
  if (!stick.hasPointerCapture(event.pointerId)) return;
  const box = stick.getBoundingClientRect();
  const x = event.clientX - box.left - box.width / 2;
  const y = event.clientY - box.top - box.height / 2;
  const d = Math.max(1, len(x, y));
  const m = clamp(d, 0, 54);
  world.input.x = x / d * Math.min(1, d / 54);
  world.input.y = y / d * Math.min(1, d / 54);
  nub.style.transform = `translate(${x / d * m}px, ${y / d * m}px)`;
}

function reset(touch, nub, world) {
  touch.active = false;
  world.input.x = 0;
  world.input.y = 0;
  nub.style.transform = '';
}
