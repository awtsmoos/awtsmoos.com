// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Malchus terrain: the first breath of the ladder.
 *
 * The Awtsmoos makes dust into a readable staircase. Every mandatory shelf is
 * broad, every rise is humane, and the optional sky path begins as a visible
 * spine rather than a compressed riddle above the player's head.
 */
export const malchusPlatforms = [
  P(0, 505, 540, 35),
  P(620, 445, 190, 20),
  P(880, 385, 190, 20),
  P(1140, 325, 200, 20),
  P(1410, 385, 210, 20),
  P(1690, 325, 210, 20),
  P(1950, 385, 210, 20),
  P(560, 350, 170, 18),
  P(780, 280, 180, 18),
  P(1000, 210, 190, 18),
  P(1220, 140, 200, 18),
  P(1440, 70, 210, 18),
  P(1660, 0, 220, 18),
  P(1880, -70, 230, 18)
];

export const malchusRotors = [
  R(545, 474, 76, 14, 0.75, 160)
];

export const malchusTricks = [
  T(960, 369, 86, 16, 'shatter', { reform: 2.6 }),
  T(1280, 309, 86, 16, 'phantom'),
  T(1530, 369, 86, 16, 'falseSpike'),
  T(1830, 309, 96, 16, 'commitDrop', { reform: 2.4 }),
  T(1700, -18, 104, 16, 'safeSpike')
];
