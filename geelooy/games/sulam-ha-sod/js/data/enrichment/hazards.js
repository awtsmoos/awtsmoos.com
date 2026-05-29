// B"H
import { S, G } from '../levelPrimitives.js';
import { movingSpike } from './builders.js';
import { safeTriggerX } from './geometry.js';

/**
 * Chapter 35: The Awtsmoos moved teeth away from the learning path.
 *
 * Hazards still exist, but the upper staircase and first sky balcony are now
 * learning spaces, not ambush corridors. Moving teeth orbit and roll off to the
 * side, with warning, leaving the broad route itself readable.
 *
 * @param {object} level Mutable level clone.
 * @param {number} index Zero-based index.
 * @param {object} frame Enrichment frame.
 * @returns {void}
 */
export function addHarderHazards(level, index, frame) {
  const { anchor, far, skyY: y } = frame;
  level.spikes.push(
    S(anchor + 330, y + 330, 70, 22, 2.4, 1.4, 3.8),
    S(far + 420, y - 150, 62, 20, 2.6, 1.5, 4.0)
  );
  addPatrolHazards(level, index, frame);
}

/** @param {object} level @param {number} index @param {object} frame */
export function addPatrolHazards(level, index, frame) {
  const { anchor, skyY: y } = frame;
  const groundX = Math.min(level.width - 760, 1420 + index * 130);
  level.spikes.push(
    movingSpike(groundX, 470, 46, 26, { rollSpeed: 110 + index * 2, minX: groundX - 150, maxX: groundX + 250, dir: index % 2 ? -1 : 1, cycle: true, period: 4.0, duty: 0.55, showDormant: true }),
    movingSpike(anchor + 760, y + 210, 30, 30, { moveY: 64, moveRate: 1.8, cycle: true, period: 3.8, duty: 0.38, showDormant: true }),
    movingSpike(anchor - 120, y + 112, 28, 28, { moveX: 70, moveRate: 2.0, cycle: true, period: 3.2, duty: 0.35, showDormant: true })
  );
  const hiddenX = safeTriggerX(level, anchor + 760);
  if (hiddenX !== null) level.triggers.push(rollingCostTrigger(hiddenX, y));
}

/** @param {number} x trigger x @param {number} y sky y @returns {object} */
function rollingCostTrigger(x, y) {
  return G(x, y + 92, 120, 100, 'A warning flash woke the side-path rolling teeth.', {
    spikes: [
      movingSpike(x - 80, y + 156, 34, 34, { rollSpeed: 150, minX: x - 160, maxX: x + 160, dir: 1, cycle: true, period: 3.4, duty: 0.55, showDormant: true }),
      movingSpike(x + 150, y + 16, 30, 30, { orbitR: 58, orbitX: x + 132, orbitY: y + 52, orbitRate: -2.0, cycle: true, period: 3.1, duty: 0.42, showDormant: true })
    ]
  });
}
