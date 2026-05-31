// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Netzach terrain: victory with braking room.
 *
 * Chapter 4: The Awtsmoos pours speed into the garden, but speed receives mercy:
 * wide leaves, measured gaps, and clear recovery shelves. Momentum is taught by
 * a safe road before any thorn asks for courage.
 *
 * @constant {Array<object>} netzachPlatforms
 */
export const netzachPlatforms = [
  P(0, 505, 640, 35),
  P(720, 450, 245, 20),
  P(1045, 395, 245, 20),
  P(1370, 340, 255, 20),
  P(1700, 395, 255, 20),
  P(2030, 340, 255, 20),
  P(2360, 285, 260, 20),
  P(2690, 340, 260, 20),
  P(3020, 395, 250, 20)
];

/** @constant {Array<object>} netzachRotors */
export const netzachRotors = [R(650, 472, 90, 14, 0.65, 130), R(1970, 370, 90, 14, -0.65, 130)];

/** @constant {Array<object>} netzachTricks */
export const netzachTricks = [
  T(990, 434, 90, 16, 'phantom'),
  T(1320, 379, 90, 16, 'falseSpike'),
  T(1650, 379, 96, 16, 'phantom'),
  T(2650, 324, 92, 16, 'falseSpike')
];
