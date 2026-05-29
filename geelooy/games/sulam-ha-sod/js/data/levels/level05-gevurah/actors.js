// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Gevurah actors and reward scroll.
 *
 * The Awtsmoos makes the court breathe: coins testify, fake coins accuse,
 * enemies carry verdicts in their bodies, and one living scroll must be stomped
 * before the exit can believe the player's claim.
 */
export const gevurahCoins = [
  C(250, 460), C(535, 420), C(800, 355, 'dinar'), C(1060, 295, 'sela'),
  C(1300, 240), C(1585, 150, 'dinar'), C(1830, 90, 'sela'),
  C(2075, 145, 'dinar'), C(1880, 380), C(2240, 300, 'sela'),
  C(2460, 260), C(3095, 290, 'maneh')
];

export const gevurahKeys = [C(3460, 340, 'dinar')];

export const gevurahSpikes = [
  S(370, 481, 80, 24, 1.2, 1.1, 2.4),
  S(1730, 481, 85, 24, 1.8, 1.2, 2.8),
  S(2550, 276, 70, 24, 2.1, 1.2, 2.6),
  S(3340, 481, 90, 24, 2.5, 1.1, 2.2),
  S(2940, 486, 70, 24, 1.3, 1, 2.2)
];

export const gevurahEnemies = [
  E(1860, 386, 1840, 1990, 80, 'golem', 'iron verdict'),
  E(2060, 151, 2020, 2150, 95, 'scroll', 'coin-swallowing scroll', { dropCoin: 'dinar' }),
  E(3060, 296, 3000, 3180, 130, 'herder', 'court bailiff')
];

export const gevurahExtra = {
  fakeCoins: [
    F(920, 335, 'dinar', 'The verdict coin was a tooth.'),
    F(2500, 260, 'sela', 'The court taxed your curiosity.'),
    F(3040, 284, 'dinar', 'The straight-line reward was sentencing bait.')
  ],
  trickCoins: [{ x: 2450, y: 260, kind: 'trapBait', baitX: 2920, speed: 230, min: 2400, max: 2960 }]
};
