// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Yesod terrain: reflection made readable.
 *
 * Chapter 2: The Awtsmoos pours mirror-water under the player's feet. It may
 * shimmer and lie, but the shelves are widened so the body can test the lie
 * without being crushed between sky and doubt. The mid-spine support is placed
 * where fairness settles it into the readable band after all enrichments merge.
 */
export const yesodPlatforms = [
  P(0, 505, 500, 35),
  P(580, 450, 185, 20),
  P(830, 395, 185, 20),
  P(1080, 340, 195, 20),
  P(1340, 285, 205, 20),
  P(1610, 345, 210, 20),
  P(1880, 290, 210, 20),
  P(2160, 235, 220, 20),
  P(2360, 295, 180, 20),
  P(545, 352, 205, 18),
  P(760, 286, 215, 18),
  P(980, 220, 225, 18),
  P(1200, 154, 235, 18),
  P(1420, 88, 245, 18),
  P(1640, 26, 255, 18),
  P(1698, -20, 190, 18),
  P(1888, -215, 190, 18),
  P(2078, -305, 190, 18),
  P(1865, -34, 260, 18),
  P(2085, -92, 270, 18)
];

export const yesodRotors = [
  R(520, 430, 76, 14, -0.8, 160),
  R(1750, 320, 82, 14, 0.9, 170)
];

export const yesodTricks = [
  T(940, 379, 82, 16, 'vanish', { reform: 2.1 }),
  T(1220, 324, 84, 16, 'phantom'),
  T(1485, 269, 86, 16, 'falseSpike'),
  T(2030, 274, 90, 16, 'shatter', { reform: 2.3 }),
  T(2245, 219, 96, 16, 'commitDrop', { reform: 2.4 }),
  T(1752, 8, 92, 16, 'safeSpike')
];
