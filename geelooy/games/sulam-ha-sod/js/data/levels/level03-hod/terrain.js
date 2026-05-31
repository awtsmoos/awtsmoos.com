// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Hod terrain: arguments become shelves, not walls.
 *
 * Chapter 3: The Awtsmoos opens the library slowly. Each platform is a page
 * wide enough for the player to stand, read the next gap, and answer. The route
 * climbs in measured clauses and never hides a required coin in a cramped slot.
 *
 * @constant {Array<object>} hodPlatforms
 */
export const hodPlatforms = [
  P(0, 505, 630, 35),
  P(710, 450, 240, 20),
  P(1030, 390, 240, 20),
  P(1350, 330, 250, 20),
  P(1670, 270, 250, 20),
  P(1990, 330, 250, 20),
  P(2310, 390, 250, 20),
  P(2630, 330, 260, 20)
];

/** @constant {Array<object>} hodRotors */
export const hodRotors = [R(635, 472, 90, 14, 0.6, 125)];

/** @constant {Array<object>} hodTricks */
export const hodTricks = [
  T(970, 434, 86, 16, 'phantom'),
  T(1290, 374, 86, 16, 'falseSpike'),
  T(2255, 374, 92, 16, 'phantom')
];
