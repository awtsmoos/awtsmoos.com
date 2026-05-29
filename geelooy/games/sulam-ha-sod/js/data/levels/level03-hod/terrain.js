// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Hod terrain: arguments arranged as clear shelves.
 *
 * The Awtsmoos lets Hod question the eye without compressing the body. The main
 * route reads left to right, while the upper library ladder is visibly optional
 * and never asks for a blind ceiling jump.
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
  P(560, 345, 170, 18),
  P(780, 275, 180, 18),
  P(1000, 205, 190, 18),
  P(1220, 135, 200, 18),
  P(1440, 65, 210, 18),
  P(1660, -5, 220, 18),
  P(1880, -75, 230, 18),
  P(2100, -145, 240, 18)
];

export const hodRotors = [
  R(520, 428, 76, 14, 1.0, 180),
  R(1770, 306, 84, 14, -1.1, 190)
];

export const hodTricks = [
  T(930, 374, 82, 16, 'shatter', { reform: 2.2 }),
  T(1230, 314, 84, 16, 'phantom'),
  T(1490, 254, 86, 16, 'falseSpike'),
  T(2240, 314, 88, 16, 'vanish', { reform: 2.0 }),
  T(2525, 254, 94, 16, 'commitDrop', { reform: 2.4 }),
  T(1700, -23, 104, 16, 'safeSpike')
];
