// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Netzach terrain: momentum with braking room.
 *
 * Chapter 4: The Awtsmoos lets victory run like wind through green knives, yet
 * even speed must find a place to land. Explicit mid-spine supports keep the
 * enriched sky route readable while the garden still teaches momentum.
 */
export const netzachPlatforms = [
  P(0, 505, 500, 35), P(580, 450, 190, 20), P(850, 395, 190, 20),
  P(1120, 340, 200, 20), P(1400, 400, 210, 20), P(1680, 340, 210, 20),
  P(1960, 285, 215, 20), P(2240, 345, 220, 20), P(2530, 290, 220, 20),
  P(2840, 360, 230, 20), P(3140, 380, 190, 20), P(550, 350, 205, 18),
  P(765, 284, 215, 18), P(985, 218, 225, 18), P(1205, 152, 235, 18),
  P(1425, 86, 245, 18), P(1645, 24, 255, 18), P(1698, -125, 190, 18),
  P(1888, -215, 190, 18), P(2078, -305, 190, 18), P(1870, -36, 260, 18),
  P(2090, -94, 270, 18)
];

export const netzachRotors = [R(520, 428, 76, 14, 0.9, 170), R(1840, 315, 84, 14, -1.05, 185)];

export const netzachTricks = [
  T(1000, 379, 90, 16, 'ice', { duration: 0.9 }),
  T(1285, 324, 84, 16, 'phantom'),
  T(1505, 384, 96, 16, 'booster', { dir: 1, boost: 500, lift: 30 }),
  T(2160, 329, 86, 16, 'falseSpike'),
  T(2660, 274, 92, 16, 'ice', { duration: 0.9 }),
  T(3000, 344, 96, 16, 'commitDrop', { reform: 2.4 }),
  T(1756, 6, 92, 16, 'safeSpike')
];
