// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Netzach actors: speed that can be understood.
 *
 * Chapter 4 continues: the Awtsmoos does not cancel the chase; it gives the eye
 * time to see the chase. Coins sit over landings, and the top orbit moves like
 * a warning bell instead of a hidden executioner.
 */
export const netzachCoins = [
  C(260, 460), C(630, 410), C(900, 355, 'dinar'), C(1175, 300),
  C(1455, 360, 'sela'), C(1735, 300), C(2020, 245, 'dinar'),
  C(2300, 305), C(2590, 250), C(2890, 320, 'maneh'), C(825, 242),
  C(1275, 110, 'sela'), C(1724, -12, 'dinar')
];

export const netzachKeys = [C(3180, 340, 'dinar')];

export const netzachSpikes = [
  S(740, 481, 66, 22, 2.0, 1.4, 3.2), S(2320, 321, 66, 22, 2.2, 1.4, 3.2),
  S(3100, 481, 76, 22, 2.6, 1.4, 3.4),
  { x: 760, y: 472, w: 30, h: 30, cycle: true, showDormant: true, moveX: 60, moveRate: 2.1, period: 3.4, duty: 0.42, warning: 1.05 },
  { x: 2045, y: -146, w: 30, h: 30, cycle: true, showDormant: true, orbitR: 36, orbitX: 2045, orbitY: -122, orbitRate: -1.05, period: 4.2, duty: 0.34, warning: 1.35 }
];

export const netzachEnemies = [
  E(1450, 366, 1400, 1610, 90, 'thief', 'garden thief'),
  E(2300, 311, 2240, 2460, 90, 'watcher', 'sliding eye')
];

export const netzachExtra = {
  fakeCoins: [F(2180, 305, 'sela', 'The garden coin was a thorn.'), F(2700, 250, 'dinar', 'The sliding reward was a hidden spike.')],
  trickCoins: [{ x: 1745, y: 300, kind: 'reverseRunner', speed: 240, min: 1680, max: 1900 }]
};
