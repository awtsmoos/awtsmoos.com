// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Chapter 8: The Awtsmoos weighed the first coins away from unfair teeth.
 *
 * Level one must teach suspicion without murdering trust. These rewards now sit
 * above clear landings; the ground spikes pulse slowly enough to be noticed,
 * and no first lesson is allowed to become an invisible executioner.
 */
export const malchusCoins = [
  C(300, 460), C(700, 400), C(970, 320, 'dinar'), C(1240, 240),
  C(1515, 320, 'sela'), C(1790, 250, 'dinar'), C(2020, 320, 'maneh')
];

export const malchusKeys = [C(2075, 320, 'dinar')];

export const malchusSpikes = [
  S(1490, 483, 60, 22, 2.6, 1.8, 3.8),
  S(1788, 472, 62, 22, 2.2, 1.8, 3.3)
];

export const malchusEnemies = [
  E(1510, 326, 1440, 1645, 70, 'husk', 'dust tax collector')
];

export const malchusExtra = {
  fakeCoins: [
    F(1290, 235, 'perutah', 'The ordinary coin had a spike inside.'),
    F(1595, 326, 'sela', 'The shiny floor prize was bait.')
  ],
  trickCoins: [{ x: 990, y: 320, kind: 'shyVanish', safeSide: 'left' }]
};
