// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Chesed floods the player with too much help.
 *
 * The Awtsmoos turns kindness into velocity: ice and boosters offer abundance,
 * but every excess has a boundary. The safe route requires braking after gifts,
 * refusing a low coin, and letting the echo pass before taking the final glass.
 */
export const level07 = L(
  '7 · Chesed Flood of Glass',
  4600,
  { x: 60, y: 420 },
  P(4380, 300, 44, 90),
  'Chesed overflows; too much kindness becomes slippery.',
  [P(0, 505, 400, 35), P(540, 455, 140, 20), P(820, 400, 140, 20), P(1110, 345, 150, 20), P(1400, 290, 150, 20), P(1710, 360, 160, 20), P(2020, 430, 160, 20), P(2340, 370, 160, 20), P(2660, 310, 160, 20), P(3000, 250, 160, 20), P(3340, 330, 170, 20), P(3700, 400, 180, 20), P(4080, 350, 190, 20)],
  [R(700, 430, 80, 14, 1.8, 330), R(1860, 398, 80, 14, -2, 370), R(3180, 300, 90, 14, 2.4, 420)],
  [T(975, 384, 100, 16, 'ice', { duration: 1.4 }), T(1280, 330, 80, 16, 'booster', { dir: 1, boost: 790, lift: 35 }), T(1580, 275, 80, 16, 'falseSpike'), T(1860, 344, 80, 16, 'falseSpike'), T(2220, 408, 80, 16, 'ice', { duration: 1.2 }), T(2525, 352, 86, 16, 'commitDrop', { reform: 2.4 }), T(2840, 294, 90, 16, 'phantom'), T(3180, 232, 78, 16, 'phantom'), T(3500, 314, 80, 16, 'booster', { dir: 1, boost: 830, lift: 20 }), T(3930, 384, 80, 16, 'vanish', { reform: 1.2 })],
  [C(270, 460), C(580, 415), C(860, 360, 'dinar'), C(1150, 305), C(1440, 250, 'sela'), C(1750, 320), C(2060, 390, 'dinar'), C(2380, 330), C(2700, 270, 'sela'), C(3040, 210), C(3740, 360, 'dinar'), C(4120, 310, 'maneh')],
  [C(4240, 310, 'dinar')],
  [S(430, 481, 80, 24, 1.3, 1.1, 2.5), S(1660, 481, 80, 24, 1.7, 1.1, 2.8), S(2520, 481, 80, 24, 2.1, 1.2, 2.7), S(3260, 481, 90, 24, 2.5, 1.2, 2.6), S(4020, 481, 90, 24, 2.8, 1.2, 2.5), S(4200, 486, 80, 24, 1.2, 1, 2.1)],
  [E(2040, 396, 2020, 2160, 110, 'gilgul', 'overflow echo'), E(3440, 296, 3380, 3580, 125, 'herder', 'kind shove')],
  [
    G(1220, 260, 130, 110, 'Chesed pushes too generously.', {}),
    G(2420, 300, 110, 120, 'Too much gift opens a ceiling of judgment.', { spikes: [{ x: 2540, y: 126, w: 72, h: 24, warning: 0.6, duration: 1.1, fallSpeed: 390 }, { x: 2620, y: 150, w: 74, h: 24, warning: 0.72, duration: 1.1, fallSpeed: 420 }, { x: 2705, y: 174, w: 78, h: 24, warning: 0.84, duration: 1.1, fallSpeed: 450 }] }),
    G(2820, 240, 120, 110, 'Some kindness is only air.', {}),
    G(3970, 310, 130, 110, 'The flood makes a door if you stay upright.', { openExit: true })
  ],
  ['Chesed gives more ground than you can control.', 'Generosity can shove you into judgment.', 'The correct mercy is to stop before the gift finishes sliding.'],
  { fakeCoins: [F(1605, 235, 'sela', 'The kind coin was hiding a thorn.'), F(3560, 280, 'dinar', 'Too much gift became teeth.'), F(4050, 310, 'maneh', 'The flood offered a crown-shaped spike.')], trickCoins: [{ x: 2060, y: 390, kind: 'reverseRunner', speed: 330, min: 1980, max: 2260 }, { x: 3740, y: 360, kind: 'trapBait', baitX: 4020, speed: 220, min: 3660, max: 4060 }] }
);
