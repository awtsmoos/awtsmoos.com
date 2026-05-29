// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Gevurah terrain: judgment with clear appeal.
 *
 * The Awtsmoos keeps force platforms severe but readable. Each shove points to
 * a broad landing, and the upper argument is an optional staircase, not a hidden
 * requirement squeezed between ceilings. A side appeal ladder reaches the high
 * enriched coin without touching shared generation code.
 */
export const gevurahPlatforms = [
  P(0, 505, 500, 35), P(580, 445, 190, 20), P(850, 385, 190, 20),
  P(1120, 325, 200, 20), P(1390, 265, 210, 20), P(1660, 335, 210, 20),
  P(1940, 395, 215, 20), P(2220, 335, 220, 20), P(2500, 275, 220, 20),
  P(2780, 215, 220, 20), P(3070, 300, 230, 20), P(3380, 360, 210, 20),
  P(560, 340, 170, 18), P(780, 270, 180, 18), P(1000, 200, 190, 18),
  P(1220, 130, 200, 18), P(1440, 60, 210, 18), P(1660, -10, 220, 18),
  P(1880, -80, 230, 18), P(2100, -150, 240, 18),
  P(1040, 40, 180, 18), P(1040, -80, 180, 18), P(1040, -200, 180, 18),
  P(1040, -300, 180, 18)
];

export const gevurahRotors = [R(520, 425, 76, 14, 1.0, 180), R(1840, 370, 84, 14, -1.2, 200), R(2920, 276, 84, 14, 1.2, 205)];

export const gevurahTricks = [
  T(930, 369, 86, 16, 'falseSpike'),
  T(1180, 309, 92, 16, 'booster', { dir: 1, boost: 620, lift: 34 }),
  T(1450, 249, 90, 16, 'ice', { duration: 1.0 }),
  T(2300, 319, 86, 16, 'phantom'),
  T(3180, 284, 96, 16, 'reverseBooster', { dir: 1, boost: 620, lift: 20 }),
  T(1700, -28, 104, 16, 'safeSpike'),
  T(1980, -98, 104, 16, 'commitDrop', { reform: 2.3 })
];
