// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Tiferes is beautiful only when balance defeats autopilot.
 *
 * The Awtsmoos sets a prism of readable lies: matching platforms do not share
 * truth, pretty coins may be spikes, and the safest line requires a brief left
 * correction before the final ice. Every betrayal has a shimmer, a gap, or a
 * trigger message so the chamber is hard but not impossible.
 */
export const level06 = L(
  '6 · Tiferes Balance Prism',
  4200,
  { x: 60, y: 420 },
  P(3980, 260, 44, 90),
  'Tiferes balances beauty against betrayal: symmetry is bait.',
  [P(0, 505, 380, 35), P(520, 450, 130, 20), P(780, 390, 130, 20), P(1030, 330, 130, 20), P(1280, 270, 140, 20), P(1570, 340, 150, 20), P(1860, 405, 150, 20), P(2160, 340, 150, 20), P(2460, 280, 150, 20), P(2760, 350, 160, 20), P(3100, 420, 180, 20), P(3460, 350, 170, 20), P(3780, 320, 170, 20)],
  [R(670, 425, 70, 14, 1.6, 320), R(1740, 375, 80, 14, -2.1, 360), R(3300, 390, 85, 14, 2.3, 420)],
  [T(920, 374, 80, 16, 'ice', { duration: 1.1 }), T(1190, 314, 70, 16, 'falseSpike'), T(1460, 254, 85, 16, 'booster', { dir: 1, boost: 700, lift: 20 }), T(1740, 326, 75, 16, 'falseSpike'), T(2040, 390, 80, 16, 'phantom'), T(2340, 292, 86, 16, 'commitDrop', { reform: 2.3 }), T(2640, 262, 80, 16, 'vanish', { reform: 1.4 }), T(2920, 334, 80, 16, 'phantom'), T(3400, 404, 92, 16, 'reverseBooster', { dir: 1, boost: 720 }), T(3660, 334, 90, 16, 'ice', { duration: 1.2 })],
  [C(250, 460), C(555, 410), C(815, 350, 'dinar'), C(1065, 290, 'sela'), C(1320, 230), C(1605, 300, 'dinar'), C(1900, 365), C(2200, 300, 'sela'), C(2500, 240), C(3140, 380, 'dinar'), C(3820, 280, 'maneh')],
  [C(3510, 310, 'dinar')],
  [S(430, 481, 80, 24, 1.4, 1.2, 2.8), S(1680, 481, 80, 24, 1.8, 1.2, 2.5), S(2320, 316, 70, 24, 2.1, 1.3, 2.6), S(3380, 481, 90, 24, 2.4, 1.2, 2.5), S(3920, 486, 75, 24, 1.2, 1, 2.1)],
  [E(2180, 306, 2160, 2300, 100, 'ayin', 'balance eye'), E(3180, 386, 3100, 3290, 120, 'leaper', 'prism leaper')],
  [
    G(1280, 210, 120, 110, 'Balance is not safety; it is aim.', {}),
    G(2500, 230, 120, 100, 'A perfect-looking rung disappears after trust.', {}),
    G(2960, 260, 110, 120, 'The prism drops teeth on the centered route.', { spikes: [{ x: 3060, y: 126, w: 70, h: 24, warning: 0.62, duration: 1.1, fallSpeed: 380 }, { x: 3140, y: 150, w: 74, h: 24, warning: 0.74, duration: 1.1, fallSpeed: 405 }, { x: 3225, y: 174, w: 78, h: 24, warning: 0.86, duration: 1.1, fallSpeed: 430 }] }),
    G(3600, 280, 130, 110, 'The prism accepts the balanced route.', { openExit: true })
  ],
  ['Tiferes gives the prettiest traps the clearest tells.', 'Beauty becomes playable when it is honest.', 'The correct route crosses beauty, reverses once, and refuses the centered coin.'],
  { fakeCoins: [F(1225, 280, 'sela', 'Beauty wore a spike-mask.'), F(3200, 380, 'dinar', 'A bright coin snapped shut.'), F(3680, 294, 'sela', 'The final prism coin was a blade.')], trickCoins: [{ x: 2470, y: 240, kind: 'shyVanish', safeSide: 'right' }, { x: 3150, y: 380, kind: 'trapBait', baitX: 3370, speed: 210, min: 3060, max: 3420 }] }
);
