// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Netzach actors and prizes.
 *
 * The Awtsmoos hides appetite inside gold and breath inside enemies. Some
 * rewards are real, some are thorns, and one coin runs backward through habit.
 */
export const netzachCoins = [
  C(260, 460), C(610, 415), C(860, 365, 'dinar'), C(1120, 320),
  C(1410, 380, 'sela'), C(1705, 320), C(1980, 265, 'dinar'),
  C(2560, 280), C(2920, 380, 'maneh')
];

export const netzachKeys = [C(3040, 360, 'dinar')];

export const netzachSpikes = [
  S(740, 481, 70, 24, 1.6, 1.2, 3), S(2320, 356, 70, 24, 2, 1.3, 3),
  S(3100, 481, 80, 24, 2.4, 1.2, 2.8), S(1760, 486, 65, 24, 1.4, 1.1, 2.4)
];

export const netzachEnemies = [
  E(1360, 386, 1320, 1460, 110, 'thief', 'garden thief'),
  E(2260, 346, 2220, 2380, 115, 'watcher', 'sliding eye')
];

export const netzachExtra = {
  fakeCoins: [F(2160, 310, 'sela', 'The garden coin was a thorn.'), F(2745, 260, 'dinar', 'The sliding reward was a hidden spike.')],
  trickCoins: [{ x: 1680, y: 320, kind: 'reverseRunner', speed: 300, min: 1620, max: 1860 }]
};
