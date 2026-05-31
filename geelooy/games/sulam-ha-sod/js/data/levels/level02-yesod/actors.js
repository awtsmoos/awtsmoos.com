// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Yesod actors: reflection without betrayal of reach.
 *
 * Chapter 2 continues: the Awtsmoos places the mirror coins where the player
 * can land, gather, and breathe. Required collection follows the main causeway;
 * deception sits to the side and announces its lesson.
 *
 * @constant {Array<object>} yesodCoins
 */
export const yesodCoins = [
  C(260, 460),
  C(760, 410),
  C(1075, 355, 'dinar'),
  C(1385, 300),
  C(1705, 245, 'sela'),
  C(2025, 300),
  C(2320, 355, 'maneh')
];

/** @constant {Array<object>} yesodKeys */
export const yesodKeys = [C(2395, 355, 'dinar')];

/** @constant {Array<object>} yesodSpikes */
export const yesodSpikes = [
  S(535, 483, 54, 22, 2.4, 1.6, 3.8),
  S(1885, 263, 50, 20, 2.5, 1.7, 3.9)
];

/** @constant {Array<object>} yesodEnemies */
export const yesodEnemies = [
  E(1120, 361, 1030, 1230, 50, 'husk', 'mirror husk'),
  E(2020, 306, 1970, 2190, 55, 'watcher', 'watching reflection')
];

/** @constant {object} yesodExtra */
export const yesodExtra = {
  fakeCoins: [F(1275, 300, 'sela', 'The reflected sela was a spike.')],
  trickCoins: []
};
