// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Hod actors: readable arguments with real rewards.
 *
 * The Awtsmoos places scrolls and eyes where the player can see them. Coins sit
 * above landings, fake coins sit as optional side-arguments, and moving spikes
 * announce motion in the open.
 */
export const hodCoins = [
  C(280, 460), C(620, 410, 'dinar'), C(880, 350), C(1145, 290, 'sela'),
  C(1415, 230), C(1690, 290, 'dinar'), C(1960, 350), C(2240, 290, 'sela'),
  C(2520, 230), C(2810, 290, 'maneh'), C(820, 233), C(1265, 93, 'sela'),
  C(1710, -47, 'dinar')
];

export const hodKeys = [C(2820, 290, 'dinar')];

export const hodSpikes = [
  S(1320, 481, 70, 22, 2.2, 1.5, 3.3),
  S(2380, 481, 72, 22, 2.6, 1.5, 3.5),
  { x: 730, y: 472, w: 30, h: 30, cycle: true, showDormant: true, moveX: 58, moveRate: 2.1, period: 3.4, duty: 0.42, warning: 1.05 },
  { x: 1900, y: -118, w: 30, h: 30, cycle: true, showDormant: true, orbitR: 46, orbitX: 1900, orbitY: -96, orbitRate: 1.7, period: 3.6, duty: 0.38, warning: 1.1 }
];

export const hodEnemies = [
  E(1660, 296, 1630, 1840, 78, 'scroll', 'argument scroll'),
  E(2240, 296, 2170, 2390, 90, 'watcher', 'margin eye')
];

export const hodExtra = {
  fakeCoins: [
    F(1295, 290, 'sela', 'The library coin was a spike with a title.'),
    F(2320, 290, 'dinar', 'The footnote glittered falsely.')
  ],
  trickCoins: [{ x: 1710, y: 288, kind: 'reverseRunner', speed: 240, min: 1630, max: 1840 }]
};
