// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Netzach actors: speed that can be understood.
 *
 * The Awtsmoos lets the garden push the player, but the prizes sit above clear
 * landings and the moving hazards patrol where their motion can be read.
 */
export const netzachCoins = [
  C(260, 460), C(630, 410), C(900, 355, 'dinar'), C(1175, 300),
  C(1455, 360, 'sela'), C(1735, 300), C(2020, 245, 'dinar'),
  C(2300, 305), C(2590, 250), C(2890, 320, 'maneh'), C(820, 233),
  C(1265, 93, 'sela'), C(1710, -47, 'dinar')
];

export const netzachKeys = [C(3180, 340, 'dinar')];

export const netzachSpikes = [
  S(740, 481, 66, 22, 2.0, 1.4, 3.2), S(2320, 321, 66, 22, 2.2, 1.4, 3.2),
  S(3100, 481, 76, 22, 2.6, 1.4, 3.4),
  { x: 760, y: 472, w: 30, h: 30, cycle: true, showDormant: true, moveX: 60, moveRate: 2.1, period: 3.4, duty: 0.42, warning: 1.05 },
  { x: 1920, y: -118, w: 30, h: 30, cycle: true, showDormant: true, orbitR: 48, orbitX: 1920, orbitY: -96, orbitRate: -1.7, period: 3.6, duty: 0.38, warning: 1.1 }
];

export const netzachEnemies = [
  E(1450, 366, 1400, 1610, 90, 'thief', 'garden thief'),
  E(2300, 311, 2240, 2460, 90, 'watcher', 'sliding eye')
];

export const netzachExtra = {
  fakeCoins: [F(2180, 305, 'sela', 'The garden coin was a thorn.'), F(2700, 250, 'dinar', 'The sliding reward was a hidden spike.')],
  trickCoins: [{ x: 1745, y: 300, kind: 'reverseRunner', speed: 260, min: 1680, max: 1900 }]
};
