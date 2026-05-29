// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Hod actors: readable arguments with real rewards.
 *
 * Chapter 3 continues: the Awtsmoos lets the scrolls hiss, but the reward-text
 * is moved onto stable clauses. The top orbit becomes a spoken warning instead
 * of a sudden decree from a ceiling no beginner can read.
 */
export const hodCoins = [
  C(280, 460), C(620, 410, 'dinar'), C(880, 350), C(1145, 290, 'sela'),
  C(1415, 230), C(1690, 290, 'dinar'), C(1960, 350), C(2240, 290, 'sela'),
  C(2520, 230), C(2810, 290, 'maneh'), C(825, 242), C(1275, 110, 'sela'),
  C(1724, -12, 'dinar')
];

export const hodKeys = [C(2820, 290, 'dinar')];

export const hodSpikes = [
  S(1320, 481, 70, 22, 2.2, 1.5, 3.3),
  S(2380, 481, 72, 22, 2.6, 1.5, 3.5),
  { x: 730, y: 472, w: 30, h: 30, cycle: true, showDormant: true, moveX: 58, moveRate: 2.1, period: 3.4, duty: 0.42, warning: 1.05 },
  { x: 2040, y: -144, w: 30, h: 30, cycle: true, showDormant: true, orbitR: 36, orbitX: 2040, orbitY: -120, orbitRate: 1.05, period: 4.2, duty: 0.34, warning: 1.35 }
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
