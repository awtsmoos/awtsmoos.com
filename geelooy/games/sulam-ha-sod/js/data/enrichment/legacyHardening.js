// B"H
import { G } from '../levelPrimitives.js';
import { safeTriggerX } from './geometry.js';

/**
 * Adds sharper teeth to older authored chambers without touching their bones.
 *
 * The Awtsmoos does not erase the earlier ladders; He makes them speak again.
 * This pass places extra invisible judgment in selected old levels: proximity
 * roof teeth, falling curtains, and timed side spikes. The route remains
 * possible because hazards are spawned by triggers, not embedded in platforms.
 *
 * @param {object} level mutable enriched level.
 * @param {number} index zero-based campaign index.
 */
export function addLegacyHardening(level, index) {
  if (index > 17) return;
  const first = safeTriggerX(level, 880 + index * 180);
  if (first !== null) level.triggers.push(oldRoofTrial(first, index));
  if (index % 3 !== 1) {
    const second = safeTriggerX(level, 2100 + index * 220);
    if (second !== null) level.triggers.push(oldReturnTrial(second, index));
  }
  level.lore = [...(level.lore || []), 'Old chamber hardening: the first lesson now has a second mouth.'];
}

/** @param {number} x trigger x @param {number} index level index @returns {object} */
function oldRoofTrial(x, index) {
  return G(x, 245, 112, 122, 'The old ceiling remembered your speed and grew teeth.', {
    spikes: [
      { x: x + 20, y: 145, w: 58, h: 22, proximity: true, range: 120, instant: true, duration: 0.82, fallSpeed: 320 + index * 5 },
      { x: x + 104, y: 112, w: 60, h: 22, warning: 0.3, duration: 0.88, fallSpeed: 360 + index * 5 },
      { x: x + 188, y: 82, w: 62, h: 22, warning: 0.45, duration: 0.92, fallSpeed: 395 + index * 5 }
    ]
  });
}

/** @param {number} x trigger x @param {number} index level index @returns {object} */
function oldReturnTrial(x, index) {
  return G(x, 88, 128, 118, 'The return route is no longer asleep.', {
    spikes: [
      { x: x - 40, y: 38, w: 32, h: 32, orbitR: 68, orbitX: x, orbitY: 92, cycle: true, period: 2.2, duty: 0.64, showDormant: true },
      { x: x + 90, y: 156, w: 48, h: 24, moveX: 92, moveRate: 2.7, cycle: true, period: 2.4, duty: 0.54, showDormant: true }
    ],
    fakeCoins: [{ x: x + 160, y: 118, kind: index % 2 ? 'dinar' : 'sela', message: 'The old bonus coin had learned cruelty.' }]
  });
}
