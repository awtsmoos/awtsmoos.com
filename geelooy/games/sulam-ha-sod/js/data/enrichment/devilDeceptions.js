// B"H
import { C, T, G } from '../levelPrimitives.js';
import { movingSpike } from './builders.js';
import { safeTriggerX } from './geometry.js';

/**
 * Chapter 4: The Awtsmoos made the devil's riddle readable.
 *
 * This scroll still teaches the brutal joke: some spikes are bridges and some
 * bridges dodge. But spawned teeth now pulse first, wait long enough for human
 * hands, and leave a visible dodge lane before collision is born.
 *
 * @param {object} level Mutable level clone.
 * @param {number} index Zero-based level index.
 * @param {object} frame Enrichment placement frame.
 * @returns {void}
 */
export function addDevilDeceptions(level, index, frame) {
  const { anchor, skyY: y } = frame;
  level.trickPlatforms.push(
    T(anchor + 94, y + 214, 84, 18, 'safeSpike'),
    T(anchor + 300, y + 28, 96, 18, 'dodgePlatform', { slide: index % 2 ? -135 : 135, drop: 22, range: 150, panicTime: 0.7, reset: 1.7 })
  );
  level.coins.push(C(anchor + 114, y + 172, index > 16 ? 'sela' : 'dinar'));
  addCloseCostTrigger(level, index, frame);
}

/**
 * Places one readable proximity trap near the devil route.
 *
 * @param {object} level Mutable level clone.
 * @param {number} index Zero-based level index.
 * @param {object} frame Placement frame.
 * @returns {void}
 */
function addCloseCostTrigger(level, index, frame) {
  const { anchor, skyY: y } = frame;
  const x = safeTriggerX(level, anchor + 375);
  if (x === null) return;
  level.triggers.push(G(x, y + 22, 118, 96, 'Red light first, teeth second: step aside.', {
    spikes: [
      movingSpike(x - 18, y + 84, 66, 22, { warning: 1.15, duration: 0.86, fallSpeed: 0, showDormant: true, safe: 160 }),
      movingSpike(x + 64, y + 48, 44, 44, { orbitR: 54, orbitX: x + 74, orbitY: y + 70, orbitRate: index % 2 ? 3.4 : -3.4, warning: 1.2, duration: 1.15, showDormant: true })
    ],
    trickPlatforms: [
      T(x + 146, y + 98, 92, 16, index % 2 ? 'vanish' : 'commitDrop', { reform: 2.1 })
    ]
  }));
}
