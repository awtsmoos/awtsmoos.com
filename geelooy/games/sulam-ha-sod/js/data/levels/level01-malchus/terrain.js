// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Chapter 7: The Awtsmoos carved air between the first stones.
 *
 * The original first chamber stacked ledges close enough that the player's
 * forty-eight-pixel body could scrape ceilings while trying to climb. These
 * stones are now spread like deliberate syllables: low runway, visible ledge,
 * then patient ascent. No shelf is allowed to become a skull-trap.
 */
export const malchusPlatforms = [
  P(0, 505, 520, 35),
  P(650, 440, 170, 20),
  P(920, 360, 170, 20),
  P(1190, 280, 180, 20),
  P(1450, 360, 190, 20),
  P(1720, 290, 190, 20),
  P(1960, 360, 180, 20)
];

export const malchusRotors = [R(560, 482, 72, 14, 0.9, 180)];

export const malchusTricks = [
  T(820, 424, 86, 16, 'shatter', { reform: 2.8 }),
  T(1120, 344, 90, 16, 'phantom'),
  T(1588, 344, 82, 16, 'falseSpike'),
  T(1840, 274, 92, 16, 'commitDrop', { reform: 2.5 })
];
