// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Hod actors: scrolls that test, not suffocate.
 *
 * Chapter 3 continues: the Awtsmoos lets argument take shape as coin, enemy,
 * and warning tooth. The required path remains one readable sentence from spawn
 * to gate, with every reward placed above a stable clause of floor.
 *
 * @constant {Array<object>} hodCoins
 */
export const hodCoins = [
  C(270, 460),
  C(775, 410, 'dinar'),
  C(1095, 350),
  C(1415, 290, 'sela'),
  C(1735, 230),
  C(2055, 290, 'dinar'),
  C(2375, 350),
  C(2705, 290, 'maneh')
];

/** @constant {Array<object>} hodKeys */
export const hodKeys = [C(2810, 290, 'dinar')];

/** @constant {Array<object>} hodSpikes */
export const hodSpikes = [
  S(545, 483, 54, 22, 2.4, 1.6, 3.8),
  S(1925, 248, 50, 20, 2.5, 1.7, 3.9)
];

/** @constant {Array<object>} hodEnemies */
export const hodEnemies = [
  E(1740, 236, 1680, 1910, 55, 'scroll', 'argument scroll'),
  E(2380, 356, 2310, 2550, 60, 'watcher', 'margin eye')
];

/** @constant {object} hodExtra */
export const hodExtra = {
  fakeCoins: [F(1300, 290, 'sela', 'The library coin was a spike with a title.')],
  trickCoins: []
};
