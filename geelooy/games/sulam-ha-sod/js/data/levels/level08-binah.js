// B"H
import { P, C, F, S, E, R, T, G, L } from '../levelPrimitives.js';

/**
 * Binah: hidden rooms that show their seams.
 *
 * Chapter 22: The Awtsmoos opened the womb and removed the cramped false
 * ceiling. Understanding should be layered, not suffocating. The route now
 * breathes between arches, while half-formed thoughts still hover as deceptive
 * shelves outside the player's required body path.
 */
export const level08 = L(
  '8 · Binah Womb of Hidden Floors', 5100, { x: 60, y: 420 }, P(4840, 260, 44, 90),
  'Binah hides structure, but false floors now reveal their suspicious seams.',
  [
    P(0, 505, 600, 35), P(700, 455, 270, 22), P(1100, 405, 255, 22),
    P(1500, 355, 245, 22), P(1900, 305, 235, 22), P(2300, 355, 235, 22),
    P(2700, 405, 235, 22), P(3100, 355, 235, 22), P(3500, 305, 235, 22),
    P(3900, 245, 250, 22), P(4310, 285, 270, 22), P(4680, 260, 250, 22)
  ],
  [R(620, 480, 94, 14, 0.55, 115), R(2260, 330, 98, 14, -0.62, 120), R(3860, 280, 98, 14, 0.6, 115)],
  [
    T(980, 438, 104, 16, 'phantom'), T(930, 439, 104, 16, 'oneWay'),
    T(1380, 388, 104, 16, 'ghostSpike'), T(1810, 288, 104, 16, 'phantom'),
    T(2225, 339, 104, 16, 'oneWay'), T(2660, 388, 108, 16, 'falseSpike'),
    T(4240, 269, 110, 16, 'oneWay'), T(4580, 260, 104, 16, 'phantom')
  ],
  [
    C(270, 460), C(770, 415), C(1170, 365, 'dinar'), C(1570, 315),
    C(1970, 265, 'sela'), C(2370, 315), C(2770, 365, 'dinar'),
    C(3170, 315), C(3570, 265, 'sela'), C(3970, 205), C(4380, 245),
    C(4740, 220, 'maneh')
  ],
  [C(4765, 220, 'dinar')],
  [S(620, 483, 48, 22, 3.0, 1.2, 4.6), S(1385, 483, 96, 25, 1.2, 1.0, 2.3), S(2665, 483, 100, 25, 1.4, 1.0, 2.5), S(3020, 483, 48, 22, 3.2, 1.2, 4.8), S(4585, 483, 88, 25, 1.5, 1.0, 2.5)],
  [E(1580, 321, 1510, 1780, 64, 'watcher', 'understanding eye'), E(4380, 251, 4310, 4590, 66, 'scroll', 'womb scroll')],
  [
    G(1100, 350, 150, 100, 'Binah reveals the real floor through bright top rims.', {}),
    G(4380, 235, 150, 110, 'Understanding opens only after every real coin.', { openExit: true })
  ],
  ['Binah makes absence readable.', 'Fake coins trace the wrong theorem.', 'All required coins live on the main path.'],
  { fakeCoins: [F(985, 398), F(1388, 350, 'dinar'), F(1830, 250, 'sela'), F(2668, 350, 'dinar'), F(4588, 222, 'maneh')], trickCoins: [] }
);
