// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Yesod terrain: reflection made readable.
 *
 * The Awtsmoos lets mirrors deceive, but not trap the body in unreadable air.
 * The main causeway steps in patient shelves, and the upper route is a visible
 * optional ladder whose entrances are broad enough for human hands.
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
  P(555, 350, 170, 18),
  P(775, 280, 180, 18),
  P(995, 210, 190, 18),
  P(1215, 140, 200, 18),
  P(1435, 70, 210, 18),
  P(1655, 0, 220, 18),
  P(1875, -70, 230, 18),
  P(2095, -140, 240, 18)
];

export const yesodRotors = [
  R(520, 430, 76, 14, -0.9, 170),
  R(1750, 320, 82, 14, 1.0, 180)
];

export const yesodTricks = [
  T(940, 379, 82, 16, 'vanish', { reform: 2.1 }),
  T(1220, 324, 84, 16, 'phantom'),
  T(1485, 269, 86, 16, 'falseSpike'),
  T(2030, 274, 90, 16, 'shatter', { reform: 2.3 }),
  T(2245, 219, 96, 16, 'commitDrop', { reform: 2.4 }),
  T(1690, -18, 104, 16, 'safeSpike')
];
