// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Netzach actors: speed that still lets the thumb recover.
 *
 * Chapter 4 continues: the Awtsmoos makes the garden run, yet each coin glows
 * above a full ledge. The enemies patrol like wind in a fence, not like invisible
 * verdicts falling from a sky the player cannot inspect.
 *
 * @constant {Array<object>} netzachCoins
 */
export const netzachCoins = [
  C(270, 460),
  C(785, 410),
  C(1110, 355, 'dinar'),
  C(1435, 300),
  C(1765, 355, 'sela'),
  C(2095, 300),
  C(2425, 245, 'dinar'),
  C(2755, 300),
  C(3090, 355, 'maneh')
];

/** @constant {Array<object>} netzachKeys */
export const netzachKeys = [C(3185, 355, 'dinar')];

/** @constant {Array<object>} netzachSpikes */
export const netzachSpikes = [
  S(555, 483, 54, 22, 2.4, 1.6, 3.8),
  S(2290, 318, 50, 20, 2.5, 1.7, 3.9)
];

/** @constant {Array<object>} netzachEnemies */
export const netzachEnemies = [
  E(1760, 361, 1710, 1940, 65, 'thief', 'garden thief'),
  E(2760, 306, 2695, 2940, 65, 'watcher', 'sliding eye')
];

/** @constant {object} netzachExtra */
export const netzachExtra = {
  fakeCoins: [F(2185, 300, 'sela', 'The garden coin was a thorn.')],
  trickCoins: []
};
