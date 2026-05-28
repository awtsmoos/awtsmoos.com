// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Hod is the first argument that lies back.
 *
 * The Awtsmoos folds a library into platforms: one shelf is a ghost, one book is
 * a coin-spike, and one invisible paragraph drops a curtain of teeth. The path
 * remains possible by pausing at the shelf shimmer and landing on the honest
 * stone after the argument scroll passes.
 */
export const level03 = L(
  '3 · Hod Library of Arguments',
  3000,
  { x: 60, y: 420 },
  P(2820, 260, 44, 90),
  'Hod argues with your eyes: regular shapes may be ghosts or teeth.',
  [P(0, 505, 380, 35), P(500, 455, 150, 20), P(760, 400, 140, 20), P(980, 345, 120, 20), P(1210, 295, 130, 20), P(1460, 360, 170, 20), P(1730, 420, 160, 20), P(1990, 355, 150, 20), P(2240, 295, 150, 20), P(2490, 355, 170, 20)],
  [R(665, 432, 70, 14, 1.8, 280), R(1640, 395, 80, 14, -1.5, 320)],
  [T(905, 380, 70, 16, 'shatter', { reform: 2.2 }), T(1160, 330, 76, 16, 'phantom'), T(1390, 342, 84, 16, 'falseSpike'), T(2160, 330, 70, 16, 'vanish', { reform: 1.7 }), T(2440, 338, 86, 16, 'commitDrop', { reform: 2.5 })],
  [C(280, 460), C(540, 420, 'dinar'), C(800, 360), C(1010, 305, 'sela'), C(1240, 255), C(1770, 385, 'dinar'), C(2290, 255, 'sela'), C(2550, 315, 'maneh')],
  [C(2620, 310, 'dinar')],
  [S(1350, 481, 80, 24, 1.8, 1.3, 2.7), S(2400, 481, 85, 24, 2.2, 1.5, 3.2)],
  [E(1500, 326, 1460, 1625, 95, 'scroll', 'argument scroll'), E(2240, 261, 2180, 2370, 105, 'watcher', 'margin eye')],
  [
    G(1100, 260, 100, 100, 'The library shifts a hidden shelf.', { platforms: [P(1370, 245, 100, 18)] }),
    G(1680, 300, 95, 110, 'The paragraph above you becomes falling punctuation.', { spikes: [{ x: 1770, y: 122, w: 68, h: 22, warning: 0.6, duration: 1.08, fallSpeed: 360, safe: 90 }, { x: 1850, y: 150, w: 70, h: 22, warning: 0.72, duration: 1.08, fallSpeed: 385, safe: 90 }, { x: 1934, y: 178, w: 72, h: 22, warning: 0.84, duration: 1.08, fallSpeed: 410, safe: 90 }] }),
    G(2450, 250, 100, 100, 'The argument ends. The gate unlocks.', { openExit: true })
  ],
  ['Hod should confuse, not overlap nonsense.', 'Every hazard must be readable.', 'The safe shelf is the one that does not flatter greed.'],
  { fakeCoins: [F(1045, 300, 'sela', 'The library coin was a spike with a title.'), F(2320, 246, 'dinar', 'The footnote glittered falsely.')], trickCoins: [{ x: 1790, y: 383, kind: 'reverseRunner', speed: 260, min: 1730, max: 1920 }] }
);
