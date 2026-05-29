// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Hod actors and rewards.
 *
 * The Awtsmoos writes argument into coin and enemy. A scroll patrols the lower
 * shelf, an eye guards the margin, and every reward must be considered before
 * the hand believes it.
 */
export const hodCoins = [
  C(280, 460), C(540, 420, 'dinar'), C(800, 360), C(1010, 305, 'sela'),
  C(1240, 255), C(1770, 385, 'dinar'), C(2290, 255, 'sela'), C(2550, 315, 'maneh')
];

export const hodKeys = [C(2620, 310, 'dinar')];

export const hodSpikes = [
  S(1350, 481, 80, 24, 1.8, 1.3, 2.7),
  S(2400, 481, 85, 24, 2.2, 1.5, 3.2)
];

export const hodEnemies = [
  E(1500, 326, 1460, 1625, 95, 'scroll', 'argument scroll'),
  E(2240, 261, 2180, 2370, 105, 'watcher', 'margin eye')
];

export const hodExtra = {
  fakeCoins: [
    F(1045, 300, 'sela', 'The library coin was a spike with a title.'),
    F(2320, 246, 'dinar', 'The footnote glittered falsely.')
  ],
  trickCoins: [{ x: 1790, y: 383, kind: 'reverseRunner', speed: 260, min: 1730, max: 1920 }]
};
