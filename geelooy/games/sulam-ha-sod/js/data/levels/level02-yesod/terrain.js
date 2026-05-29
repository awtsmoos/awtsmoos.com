// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Yesod terrain scroll.
 *
 * The Awtsmoos casts reflection into stone: every mirror-shelf is allowed to
 * vanish, rotate, or fracture, but the true path keeps a learnable rhythm.
 */
export const yesodPlatforms = [
  P(0, 505, 420, 35), P(520, 455, 130, 20), P(760, 405, 120, 20),
  P(980, 350, 120, 20), P(1220, 295, 130, 20), P(1480, 360, 160, 20),
  P(1730, 300, 140, 20), P(1980, 250, 150, 20), P(2250, 300, 140, 20)
];

export const yesodRotors = [
  R(665, 432, 70, 14, -1.4, 260),
  R(1640, 337, 80, 14, 1.3, 300)
];

export const yesodTricks = [
  T(900, 385, 70, 16, 'vanish', { reform: 1.8 }),
  T(1165, 332, 78, 16, 'phantom'),
  T(1405, 342, 82, 16, 'falseSpike'),
  T(1880, 280, 70, 16, 'shatter', { reform: 2.2 }),
  T(2170, 284, 82, 16, 'commitDrop', { reform: 2.4 })
];
