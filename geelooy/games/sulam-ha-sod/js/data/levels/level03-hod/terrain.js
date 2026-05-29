// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Hod terrain: arguments arranged as clear shelves.
 *
 * Chapter 3: The Awtsmoos opens the library of objections. Every shelf argues,
 * but none are allowed to become a hidden blade. Explicit mid-spine supports
 * keep Hod's upper argument connected after campaign enrichment.
 */
export const hodPlatforms = [
  P(0, 505, 500, 35),
  P(570, 450, 190, 20),
  P(830, 390, 190, 20),
  P(1090, 330, 200, 20),
  P(1360, 270, 205, 20),
  P(1630, 330, 210, 20),
  P(1900, 390, 210, 20),
  P(2170, 330, 220, 20),
  P(2450, 270, 230, 20),
  P(2740, 330, 210, 20),
  P(550, 350, 205, 18),
  P(765, 284, 215, 18),
  P(985, 218, 225, 18),
  P(1205, 152, 235, 18),
  P(1425, 86, 245, 18),
  P(1645, 24, 255, 18),
  P(1698, -125, 190, 18),
  P(1888, -215, 190, 18),
  P(2078, -305, 190, 18),
  P(1870, -36, 260, 18),
  P(2090, -94, 270, 18)
];

export const hodRotors = [
  R(520, 428, 76, 14, 0.9, 170),
  R(1770, 306, 84, 14, -1.0, 180)
];

export const hodTricks = [
  T(930, 374, 82, 16, 'shatter', { reform: 2.2 }),
  T(1230, 314, 84, 16, 'phantom'),
  T(1490, 254, 86, 16, 'falseSpike'),
  T(2240, 314, 88, 16, 'vanish', { reform: 2.0 }),
  T(2525, 254, 94, 16, 'commitDrop', { reform: 2.4 }),
  T(1756, 6, 92, 16, 'safeSpike')
];
