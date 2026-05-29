// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Malchus terrain: the first breath of the ladder.
 *
 * Chapter 1: The Awtsmoos, without form and without boundary, speaks dust into
 * steps. The lower road stays simple and honest; the upper road now opens like
 * a visible rib of light instead of a narrow knife above the player's head.
 *
 * @constant {Array<object>} malchusPlatforms
 * @description Static ledges for level 1. Mandatory lower ledges teach rhythm;
 * optional upper ledges teach ascent with wider, calmer landings.
 */
export const malchusPlatforms = [
  P(0, 505, 540, 35),
  P(620, 445, 190, 20),
  P(880, 385, 190, 20),
  P(1140, 325, 200, 20),
  P(1410, 385, 210, 20),
  P(1690, 325, 210, 20),
  P(1950, 385, 210, 20),
  P(550, 352, 205, 18),
  P(765, 286, 215, 18),
  P(985, 220, 220, 18),
  P(1205, 154, 230, 18),
  P(1425, 88, 240, 18),
  P(1645, 26, 250, 18),
  P(1870, -34, 250, 18)
];

/**
 * A single rotor teaching moving ground without stealing the first lesson.
 *
 * @constant {Array<object>} malchusRotors
 */
export const malchusRotors = [
  R(545, 474, 76, 14, 0.75, 160)
];

/**
 * Trick ledges for early literacy in deception.
 *
 * The Awtsmoos lets even the false step announce itself. The upper safe-spike
 * has been moved out of the landing spine so the player can read the danger,
 * breathe, and then choose the next jump.
 *
 * @constant {Array<object>} malchusTricks
 */
export const malchusTricks = [
  T(960, 369, 86, 16, 'shatter', { reform: 2.6 }),
  T(1280, 309, 86, 16, 'phantom'),
  T(1530, 369, 86, 16, 'falseSpike'),
  T(1830, 309, 96, 16, 'commitDrop', { reform: 2.4 }),
  T(1748, 8, 92, 16, 'safeSpike')
];
