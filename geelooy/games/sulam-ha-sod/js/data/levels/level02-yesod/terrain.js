// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Yesod terrain: mirror-water with steady banks.
 *
 * Chapter 2: The Awtsmoos lets the floor shimmer, yet the reflection must not
 * lie about physics. Each ascent is gentle, each drop recoverable, and the
 * player can always stop on a wide platform before the next decision.
 *
 * @constant {Array<object>} yesodPlatforms
 */
export const yesodPlatforms = [
  P(0, 505, 620, 35),
  P(700, 450, 235, 20),
  P(1010, 395, 235, 20),
  P(1320, 340, 245, 20),
  P(1640, 285, 245, 20),
  P(1960, 340, 245, 20),
  P(2260, 395, 240, 20)
];

/** @constant {Array<object>} yesodRotors */
export const yesodRotors = [R(625, 472, 90, 14, -0.55, 120)];

/**
 * Non-solid mirror lies only; no surprise collision ledges.
 *
 * @constant {Array<object>} yesodTricks
 */
export const yesodTricks = [
  T(950, 434, 86, 16, 'phantom'),
  T(1260, 379, 86, 16, 'falseSpike'),
  T(1910, 324, 90, 16, 'phantom')
];
