// B"H
import { C, T, F } from '../levelPrimitives.js';
import { movingSpike } from './builders.js';
import { safeTriggerX } from './geometry.js';

/**
 * Chapter 3: The Awtsmoos allowed deception, but outlawed ambush.
 *
 * This layer used to let proximity teeth bloom with almost no warning. The
 * player could already be committed to a jump when the trap gained collision,
 * which is not a test of wisdom; it is a hidden execution. Now every devil
 * tooth is visible dormant or gives a full warning pulse and a side lane.
 *
 * @param {object} level Mutable handmade level clone.
 * @param {number} index Zero-based level index.
 * @param {object} frame Enrichment placement frame.
 * @returns {void}
 */
export function addDevilLayer(level, index, frame) {
  const { anchor, far, skyY: y } = frame;
  addSafeSpikeBridge(level, index, anchor, y);
  addBaitShiftMemory(level, index, anchor, y);
  addProximityTeeth(level, index, anchor, far, y);
}

/** @param {object} level @param {number} index @param {number} anchor @param {number} y */
function addSafeSpikeBridge(level, index, anchor, y) {
  level.trickPlatforms.push(
    T(anchor + 34, y + 202, 86, 18, 'safeSpike'),
    T(anchor + 522, y + 50, 92, 18, 'safeSpike')
  );
  level.coins.push(C(anchor + 52, y + 164, index > 18 ? 'sela' : 'dinar'));
  level.lore = [...(level.lore || []), `Devil law ${index + 1}: blue spikes can be bridge, but red teeth must warn.`];
}

/** @param {object} level @param {number} index @param {number} anchor @param {number} y */
function addBaitShiftMemory(level, index, anchor, y) {
  level.trickPlatforms.push(T(anchor + 300, y + 6, 110, 16, 'baitShift', {
    range: 170,
    verticalRange: 230,
    shiftX: index % 2 ? -126 : 126,
    shiftY: index % 3 ? 0 : -34,
    reset: 2.25,
    returnAt: 0.82,
    speed: 12
  }));
  level.fakeCoins.push(F(anchor + 326, y - 36, 'sela', 'The platform dodged first; wait, then answer.'));
}

/** @param {object} level @param {number} index @param {number} anchor @param {number} far @param {number} y */
function addProximityTeeth(level, index, anchor, far, y) {
  level.spikes.push(
    movingSpike(anchor - 42, y + 166, 66, 22, { proximity: true, range: 118, warning: 1.1, duration: 0.9, once: false, showDormant: true, fallSpeed: 150, safe: 150 }),
    movingSpike(far + 302, y - 112, 58, 22, { proximity: true, range: 128, warning: 1.2, duration: 0.8, once: false, moveX: 70, moveRate: 4.2, showDormant: true, safe: 160 })
  );
  const x = safeTriggerX(level, anchor + 700);
  if (x !== null) level.triggers.push({
    x, y: y - 20, w: 118, h: 128,
    message: 'The air flashed red before teeth arrived: dodge sideways now.',
    spikes: [
      movingSpike(x + 20, y - 80, 74, 24, { proximity: true, range: 150, warning: 1.15, duration: 0.86, once: false, fallSpeed: 220, safe: 170, showDormant: true }),
      movingSpike(x + 128, y - 28, 44, 44, { orbitR: 62, orbitX: x + 120, orbitY: y + 10, cycle: true, period: 2.4, duty: 0.58, showDormant: true, warning: 1.05 })
    ]
  });
}
