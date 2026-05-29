// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Gevurah actors: verdicts that can be read.
 *
 * Chapter 5 continues: the Awtsmoos keeps the court severe, but not obscure.
 * Coins testify over real floor, enemies patrol visible benches, and the high
 * hazard announces itself with enough mercy for a living hand.
 */
export const gevurahCoins = [
  C(250, 460), C(630, 405), C(900, 345, 'dinar'), C(1175, 285, 'sela'),
  C(1450, 225), C(1725, 295, 'dinar'), C(2000, 355, 'sela'), C(2280, 295),
  C(2560, 235, 'sela'), C(2840, 175), C(3135, 260, 'maneh'), C(3440, 320),
  C(825, 238), C(1275, 106, 'sela'), C(1724, -16, 'dinar')
];

export const gevurahKeys = [C(3460, 320, 'dinar')];

export const gevurahSpikes = [
  S(370, 481, 76, 22, 1.8, 1.3, 3.0), S(1730, 481, 78, 22, 2.1, 1.4, 3.2),
  S(2550, 251, 66, 22, 2.4, 1.4, 3.2), S(3340, 481, 80, 22, 2.7, 1.4, 3.5),
  { x: 760, y: 472, w: 30, h: 30, cycle: true, showDormant: true, moveX: 60, moveRate: 2.1, period: 3.4, duty: 0.42, warning: 1.05 },
  { x: 2045, y: -150, w: 30, h: 30, cycle: true, showDormant: true, orbitR: 36, orbitX: 2045, orbitY: -126, orbitRate: 1.05, period: 4.2, duty: 0.34, warning: 1.35 }
];

export const gevurahEnemies = [
  E(2000, 361, 1940, 2150, 80, 'golem', 'iron verdict'),
  E(2280, 301, 2220, 2440, 90, 'scroll', 'appeal scroll', { dropCoin: 'dinar' }),
  E(3120, 266, 3070, 3300, 110, 'herder', 'court bailiff')
];

export const gevurahExtra = {
  fakeCoins: [F(940, 345, 'dinar', 'The verdict coin was a tooth.'), F(2600, 235, 'sela', 'The court taxed curiosity.'), F(3185, 260, 'dinar', 'The straight reward was bait.')],
  trickCoins: [{ x: 2570, y: 235, kind: 'trapBait', baitX: 2920, speed: 210, min: 2500, max: 2980 }]
};
