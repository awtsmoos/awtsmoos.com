// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Gevurah makes force platforms into verdicts.
 *
 * The Awtsmoos places judgment in the shove. This older chamber now has a high
 * coin argument and an enemy-carried required coin: the player must climb above
 * the simple route, then stomp a living verdict to release hidden Shefa.
 */
export const level05 = L(
  '5 · Gevurah Force Court',
  3800,
  { x: 60, y: 420 },
  P(3600, 300, 44, 90),
  'Gevurah uses force platforms like verdicts.',
  [P(0, 505, 360, 35), P(500, 455, 130, 20), P(760, 395, 120, 20), P(1010, 335, 120, 20), P(1260, 280, 130, 20), P(1540, 350, 160, 20), P(1840, 420, 160, 20), P(2120, 360, 160, 20), P(2420, 300, 150, 20), P(2720, 245, 150, 20), P(3060, 330, 170, 20), P(3400, 380, 180, 20), P(1540, 190, 120, 18), P(1780, 130, 115, 18), P(2040, 185, 120, 18)],
  [R(640, 430, 70, 14, 1.8, 300), R(1780, 395, 78, 14, -2.1, 360), R(2920, 300, 80, 14, 2.2, 390)],
  [T(900, 375, 70, 16, 'falseSpike'), T(1160, 320, 80, 16, 'booster', { dir: 1, boost: 760, lift: 30 }), T(1430, 260, 80, 16, 'ice', { duration: 0.9 }), T(2290, 340, 80, 16, 'phantom'), T(3220, 305, 85, 16, 'booster', { dir: -1, boost: 690, lift: 20 }), T(1380, 258, 70, 16, 'phantom'), T(2140, 340, 75, 16, 'falseSpike'), T(3000, 314, 90, 16, 'reverseBooster', { dir: 1, boost: 780 }), T(1700, 172, 80, 16, 'commitDrop', { reform: 2.2 })],
  [C(250, 460), C(535, 420), C(800, 355, 'dinar'), C(1060, 295, 'sela'), C(1300, 240), C(1585, 150, 'dinar'), C(1830, 90, 'sela'), C(2075, 145, 'dinar'), C(1880, 380), C(2240, 300, 'sela'), C(2460, 260), C(3095, 290, 'maneh')],
  [C(3460, 340, 'dinar')],
  [S(370, 481, 80, 24, 1.2, 1.1, 2.4), S(1730, 481, 85, 24, 1.8, 1.2, 2.8), S(2550, 276, 70, 24, 2.1, 1.2, 2.6), S(3340, 481, 90, 24, 2.5, 1.1, 2.2), S(2940, 486, 70, 24, 1.3, 1, 2.2)],
  [E(1860, 386, 1840, 1990, 80, 'golem', 'iron verdict'), E(2060, 151, 2020, 2150, 95, 'scroll', 'coin-swallowing scroll', { dropCoin: 'dinar' }), E(3060, 296, 3000, 3180, 130, 'herder', 'court bailiff')],
  [
    G(1040, 260, 120, 100, 'The court launches you where it wants.', {}),
    G(1660, 100, 120, 120, 'The high verdict is optional-looking, but required.', {}),
    G(2420, 220, 110, 110, 'A normal-looking platform may be judgment itself.', { spikes: [S(2880, 481, 70, 24, 0.4, 1, 2)] }),
    G(2820, 170, 110, 120, 'The ceiling gives three verdicts if you chase the straight coin line.', { spikes: [{ x: 2940, y: 130, w: 70, h: 24, warning: 0.6, duration: 1.1, fallSpeed: 420 }, { x: 3020, y: 150, w: 74, h: 24, warning: 0.72, duration: 1.1, fallSpeed: 440 }, { x: 3105, y: 170, w: 78, h: 24, warning: 0.84, duration: 1.1, fallSpeed: 460 }] }),
    G(3300, 300, 120, 110, 'Gevurah signs the exit decree.', { openExit: true })
  ],
  ['Gevurah is readable cruelty, not clutter.', 'The booster is safe only if you prepare.', 'A verdict coin can look exactly like a reward.'],
  { fakeCoins: [F(920, 335, 'dinar', 'The verdict coin was a tooth.'), F(2500, 260, 'sela', 'The court taxed your curiosity.'), F(3040, 284, 'dinar', 'The straight-line reward was sentencing bait.')], trickCoins: [{ x: 2450, y: 260, kind: 'trapBait', baitX: 2920, speed: 230, min: 2400, max: 2960 }] }
);
