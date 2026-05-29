// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Hod terrain scroll.
 *
 * The Awtsmoos folds a library into shelves. Some shelves flatter the eye and
 * some carry the climb. This file is separated so the upper route can be read
 * like an actual staircase, not buried inside one compressed spell.
 */
export const hodPlatforms = [
  P(0, 505, 380, 35), P(500, 455, 150, 20), P(760, 400, 140, 20),
  P(980, 345, 120, 20), P(1210, 295, 130, 20), P(1460, 360, 170, 20),
  P(1730, 420, 160, 20), P(1990, 355, 150, 20), P(2240, 295, 150, 20),
  P(2490, 355, 170, 20)
];

export const hodRotors = [
  R(665, 432, 70, 14, 1.8, 280),
  R(1640, 395, 80, 14, -1.5, 320)
];

export const hodTricks = [
  T(905, 380, 70, 16, 'shatter', { reform: 2.2 }),
  T(1160, 330, 76, 16, 'phantom'),
  T(1390, 342, 84, 16, 'falseSpike'),
  T(2160, 330, 70, 16, 'vanish', { reform: 1.7 }),
  T(2440, 338, 86, 16, 'commitDrop', { reform: 2.5 })
];
