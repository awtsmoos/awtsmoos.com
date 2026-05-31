// B"H
import { C, F, S, E } from '../../levelPrimitives.js';

/**
 * Gevurah actors: real coins, fake coins, honest consequences.
 *
 * Chapter 5 continues: the Awtsmoos returned Hebrew letters to the treasure,
 * but let several gold faces become witnesses against greed. Real coins sit on
 * the walkable verdict. Fake coins hang over false platforms and spike-mouths,
 * bright enough to tempt, suspicious enough to teach.
 *
 * @constant {Array<object>} gevurahCoins
 */
export const gevurahCoins = [
  C(250, 460), C(760, 415), C(1120, 365, 'dinar'), C(1500, 315),
  C(1880, 265, 'sela'), C(2260, 315), C(2640, 365, 'dinar'),
  C(3020, 315), C(3400, 265, 'sela'), C(3585, 260, 'maneh')
];

/** @constant {Array<object>} gevurahKeys */
export const gevurahKeys = [C(3610, 260, 'dinar')];

/** @constant {Array<object>} gevurahSpikes */
export const gevurahSpikes = [
  S(540, 483, 48, 22, 2.7, 1.3, 4.2), S(1160, 483, 90, 26, 1.2, 1.1, 2.2),
  S(1735, 483, 48, 22, 2.9, 1.3, 4.4), S(2500, 483, 100, 26, 1.4, 1.1, 2.5),
  S(3250, 483, 48, 22, 3.1, 1.3, 4.6)
];

/** @constant {Array<object>} gevurahEnemies */
export const gevurahEnemies = [
  E(1130, 371, 1080, 1320, 60, 'scroll', 'slow appeal'),
  E(2650, 371, 2580, 2850, 62, 'husk', 'court echo')
];

/** @constant {object} gevurahExtra */
export const gevurahExtra = {
  fakeCoins: [
    F(990, 392, 'dinar'), F(1325, 350, 'sela'), F(1695, 292, 'maneh'),
    F(2505, 352, 'dinar'), F(3225, 292, 'sela')
  ],
  trickCoins: []
};
