// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Gevurah terrain scroll.
 *
 * The Awtsmoos writes judgment into stone: shove platforms, icy verdicts,
 * phantom appeals, and a high side argument that forces the player to stop,
 * reverse, and climb instead of holding right like a sleeping machine.
 */
export const gevurahPlatforms = [
  P(0, 505, 360, 35), P(500, 455, 130, 20), P(760, 395, 120, 20),
  P(1010, 335, 120, 20), P(1260, 280, 130, 20), P(1540, 350, 160, 20),
  P(1840, 420, 160, 20), P(2120, 360, 160, 20), P(2420, 300, 150, 20),
  P(2720, 245, 150, 20), P(3060, 330, 170, 20), P(3400, 380, 180, 20),
  P(1540, 190, 120, 18), P(1780, 130, 115, 18), P(2040, 185, 120, 18)
];

export const gevurahRotors = [
  R(640, 430, 70, 14, 1.8, 300),
  R(1780, 395, 78, 14, -2.1, 360),
  R(2920, 300, 80, 14, 2.2, 390)
];

export const gevurahTricks = [
  T(900, 375, 70, 16, 'falseSpike'),
  T(1160, 320, 80, 16, 'booster', { dir: 1, boost: 760, lift: 30 }),
  T(1430, 260, 80, 16, 'ice', { duration: 0.9 }),
  T(2290, 340, 80, 16, 'phantom'),
  T(3220, 305, 85, 16, 'booster', { dir: -1, boost: 690, lift: 20 }),
  T(1380, 258, 70, 16, 'phantom'),
  T(2140, 340, 75, 16, 'falseSpike'),
  T(3000, 314, 90, 16, 'reverseBooster', { dir: 1, boost: 780 }),
  T(1700, 172, 80, 16, 'commitDrop', { reform: 2.2 })
];
