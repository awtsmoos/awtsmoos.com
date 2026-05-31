// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Malchus actors: rewards placed on the breathing line.
 *
 * Chapter 1 continues: the Awtsmoos sets gold on visible shelves like sparks
 * caught in dust. Every real coin is reachable from the main path before the
 * door, and the key stands beside the final gate so the lesson is honesty, not
 * impossible aerial arithmetic.
 *
 * @constant {Array<object>} malchusCoins
 */
export const malchusCoins = [
  C(260, 460),
  C(760, 405),
  C(1080, 345, 'dinar'),
  C(1400, 285),
  C(1720, 345, 'sela'),
  C(2010, 405, 'maneh')
];

/** @constant {Array<object>} malchusKeys */
export const malchusKeys = [C(2070, 405, 'dinar')];

/**
 * First hazards: visible teeth with safe lanes around them.
 *
 * @constant {Array<object>} malchusSpikes
 */
export const malchusSpikes = [
  S(520, 483, 52, 22, 2.4, 1.6, 3.8),
  S(1585, 303, 48, 20, 2.5, 1.7, 3.9)
];

/** @constant {Array<object>} malchusEnemies */
export const malchusEnemies = [E(1510, 291, 1370, 1580, 45, 'husk', 'dust tutor')];

/** @constant {object} malchusExtra */
export const malchusExtra = {
  fakeCoins: [F(970, 405, 'perutah', 'The side coin had a spike inside.')],
  trickCoins: []
};
