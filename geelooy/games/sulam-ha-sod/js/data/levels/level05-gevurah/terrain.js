// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Gevurah terrain: judgment with clear appeal.
 *
 * Chapter 5: The Awtsmoos lets judgment thunder, but the verdict must be legible.
 * Explicit mid-spine supports keep the appeal route reachable after enrichment,
 * while the court still demands attention and discipline.
 */
export const gevurahPlatforms = [
  P(0, 505, 500, 35), P(580, 445, 190, 20), P(850, 385, 190, 20),
  P(1120, 325, 200, 20), P(1390, 265, 210, 20), P(1660, 335, 210, 20),
  P(1940, 395, 215, 20), P(2220, 335, 220, 20), P(2500, 275, 220, 20),
  P(2780, 215, 220, 20), P(3070, 300, 230, 20), P(3380, 360, 210, 20),
  P(550, 346, 205, 18), P(765, 280, 215, 18), P(985, 214, 225, 18),
  P(1205, 148, 235, 18), P(1425, 82, 245, 18), P(1645, 20, 255, 18),
  P(1698, -125, 190, 18), P(1888, -215, 190, 18), P(2078, -305, 190, 18),
  P(1870, -40, 260, 18), P(2090, -98, 270, 18),
  P(1040, 44, 195, 18), P(1040, -64, 195, 18), P(1040, -172, 195, 18),
  P(1040, -270, 195, 18)
];

export const gevurahRotors = [R(520, 425, 76, 14, 0.9, 170), R(1840, 370, 84, 14, -1.05, 185), R(2920, 276, 84, 14, 1.05, 190)];

export const gevurahTricks = [
  T(930, 369, 86, 16, 'falseSpike'),
  T(1180, 309, 92, 16, 'booster', { dir: 1, boost: 540, lift: 30 }),
  T(1450, 249, 90, 16, 'ice', { duration: 0.9 }),
  T(2300, 319, 86, 16, 'phantom'),
  T(3180, 284, 96, 16, 'reverseBooster', { dir: 1, boost: 540, lift: 18 }),
  T(1756, 2, 92, 16, 'safeSpike'),
  T(1980, -78, 104, 16, 'commitDrop', { reform: 2.3 })
];
