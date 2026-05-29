// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Netzach terrain: momentum with braking room.
 *
 * The Awtsmoos makes persistence into readable shelves. Boosters and ice still
 * teach commitment, but each landing gives room to stop before the next lesson.
 */
export const netzachPlatforms = [
  P(0, 505, 500, 35), P(580, 450, 190, 20), P(850, 395, 190, 20),
  P(1120, 340, 200, 20), P(1400, 400, 210, 20), P(1680, 340, 210, 20),
  P(1960, 285, 215, 20), P(2240, 345, 220, 20), P(2530, 290, 220, 20),
  P(2840, 360, 230, 20), P(3140, 380, 190, 20), P(560, 345, 170, 18),
  P(780, 275, 180, 18), P(1000, 205, 190, 18), P(1220, 135, 200, 18),
  P(1440, 65, 210, 18), P(1660, -5, 220, 18), P(1880, -75, 230, 18),
  P(2100, -145, 240, 18)
];

export const netzachRotors = [R(520, 428, 76, 14, 1.0, 180), R(1840, 315, 84, 14, -1.2, 200)];

export const netzachTricks = [
  T(1000, 379, 90, 16, 'ice', { duration: 1.0 }),
  T(1285, 324, 84, 16, 'phantom'),
  T(1505, 384, 96, 16, 'booster', { dir: 1, boost: 560, lift: 34 }),
  T(2160, 329, 86, 16, 'falseSpike'),
  T(2660, 274, 92, 16, 'ice', { duration: 1.0 }),
  T(3000, 344, 96, 16, 'commitDrop', { reform: 2.4 }),
  T(1700, -23, 104, 16, 'safeSpike')
];
