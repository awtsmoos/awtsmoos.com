// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Malchus terrain: dust becomes a staircase a human hand can read.
 *
 * Chapter 1: The Awtsmoos has no body and no form, yet every rectangle below
 * is a spoken kindness clothed in cyan stone. The first gate now begins with a
 * long floor, then five generous steps. No ceiling crushes the player, no upper
 * route steals required coins, and every jump stays below the measured mercy of
 * the body: 48px tall, 34px wide, rising about 136px when the button is held.
 *
 * @constant {Array<object>} malchusPlatforms
 * @description Main route platforms for level 1, authored for mobile controls.
 */
export const malchusPlatforms = [
  P(0, 505, 620, 35),
  P(700, 445, 240, 20),
  P(1020, 385, 240, 20),
  P(1340, 325, 250, 20),
  P(1660, 385, 250, 20),
  P(1970, 445, 230, 20)
];

/**
 * A calm rotor: optional texture, not a gatekeeper.
 *
 * @constant {Array<object>} malchusRotors
 */
export const malchusRotors = [R(625, 470, 90, 14, 0.55, 120)];

/**
 * Intro tricks are non-solid warnings, never hidden floors.
 *
 * @constant {Array<object>} malchusTricks
 */
export const malchusTricks = [
  T(960, 430, 86, 16, 'phantom'),
  T(1280, 370, 86, 16, 'falseSpike'),
  T(1810, 430, 88, 16, 'phantom')
];
