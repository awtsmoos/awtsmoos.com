// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Shattered Ledger turns the shop idea into a level: every coin is an account.
 *
 * The Awtsmoos writes value into copper, silver, and fear. The player climbs
 * ledgers, stomps a treasurer enemy for a required coin, and learns that the
 * obvious center platform is often a receipt printed on teeth.
 */
export const level21 = L(
  '21 · Shattered Ledger of Shefa',
  12400,
  { x: 60, y: 420 },
  P(12040, 155, 44, 90),
  'A ledger can be a bridge, a debt, or a mouth.',
  [P(0, 505, 340, 35), P(520, 450, 120, 20), P(900, 390, 120, 20), P(1280, 320, 125, 20), P(1660, 245, 130, 20), P(2080, 170, 135, 20), P(2520, 245, 140, 20), P(3000, 330, 145, 20), P(3500, 410, 150, 20), P(4020, 340, 155, 20), P(4560, 270, 160, 20), P(5120, 200, 165, 20), P(5700, 280, 170, 20), P(6300, 360, 175, 20), P(6900, 285, 180, 20), P(7520, 210, 185, 20), P(8160, 130, 190, 20), P(8820, 220, 195, 20), P(9500, 310, 200, 20), P(10200, 240, 205, 20), P(10920, 175, 220, 20), P(11640, 190, 230, 20)],
  [R(720, 424, 80, 14, 3.4, 680), R(3780, 382, 92, 14, -3.9, 790), R(7920, 174, 104, 14, 4.3, 890), R(10680, 210, 110, 14, -4.2, 920)],
  [T(1080, 374, 90, 16, 'falseSpike'), T(1470, 304, 92, 16, 'ice', { duration: 1.55 }), T(1870, 229, 92, 16, 'booster', { dir: 1, boost: 1030, lift: 34 }), T(2320, 154, 94, 16, 'phantom'), T(2760, 229, 96, 16, 'commitDrop', { reform: 2.3 }), T(3260, 314, 98, 16, 'reverseBooster', { dir: 1, boost: 940 }), T(4380, 324, 100, 16, 'falseSpike'), T(4920, 254, 100, 16, 'magnet', { pull: 540 }), T(5480, 184, 102, 16, 'antiSpeed'), T(6060, 264, 104, 16, 'booster', { dir: -1, boost: 1030, lift: 30 }), T(6660, 344, 106, 16, 'fakeCheckpoint'), T(7300, 269, 108, 16, 'phantom'), T(7920, 194, 110, 16, 'ice', { duration: 1.6 }), T(8600, 114, 112, 16, 'falseSpike'), T(9280, 204, 114, 16, 'commitDrop', { reform: 2.4 }), T(9960, 294, 116, 16, 'reverseBooster', { dir: -1, boost: 980 }), T(10680, 224, 118, 16, 'booster', { dir: 1, boost: 1120, lift: 35 }), T(11360, 158, 120, 16, 'antiJump')],
  [C(260, 460), C(555, 410), C(940, 350, 'dinar'), C(1320, 280), C(1700, 205, 'sela'), C(2120, 130), C(2560, 205, 'maneh'), C(3040, 290), C(3540, 370, 'dinar'), C(4060, 300), C(4600, 230, 'sela'), C(5160, 160), C(5740, 240, 'dinar'), C(6340, 320), C(6940, 245, 'sela'), C(7560, 170), C(8200, 90, 'maneh'), C(8860, 180), C(9540, 270, 'dinar'), C(10240, 200), C(10960, 135, 'sela'), C(11680, 150, 'maneh')],
  [C(11880, 150, 'dinar')],
  [S(380, 481, 90, 24, 1, 1, 2), S(3400, 481, 100, 24, 1.7, 1, 2.2), S(6100, 481, 110, 24, 2.1, 1, 2.2), S(8700, 481, 120, 24, 1.8, 1, 2.1), S(11200, 481, 130, 24, 2.4, 1, 2.2)],
  [E(2560, 211, 2500, 2680, 125, 'watcher', 'ledger treasurer', { dropCoin: 'sela' }), E(5160, 166, 5100, 5300, 135, 'scroll', 'receipt scroll', { dropCoin: 'dinar' }), E(6960, 251, 6900, 7100, 130, 'leaper', 'account leaper'), E(9540, 276, 9480, 9700, 145, 'herder', 'debt herder'), E(10960, 141, 10900, 11120, 130, 'feign', 'fallen accountant')],
  [G(1120, 275, 130, 130, 'The first receipt is a tooth.', {}), G(2560, 150, 140, 120, 'A swallowed coin counts in the ledger.', {}), G(5600, 130, 140, 130, 'The market path climbs before it pays.', { spikes: [{ x: 5740, y: 82, w: 72, h: 24, warning: 0.55, duration: 1.1, fallSpeed: 430 }, { x: 5830, y: 112, w: 76, h: 24, warning: 0.7, duration: 1.1, fallSpeed: 460 }, { x: 5925, y: 142, w: 80, h: 24, warning: 0.85, duration: 1.1, fallSpeed: 490 }] }), G(8200, 70, 140, 120, 'The high maneh demands stillness, not speed.', {}), G(11320, 100, 160, 130, 'The final bill opens only when paid in courage.', { openExit: true })],
  ['Coins are accounts written on motion.', 'The treasurer enemy hides one required value.', 'A beautiful receipt can still be a blade.'],
  { fakeCoins: [F(1080, 335, 'dinar', 'The receipt was a spike.'), F(8620, 82, 'maneh', 'The high fake crown bit back.'), F(11380, 130, 'sela', 'The final discount was a trap.')], trickCoins: [{ x: 1760, y: 205, kind: 'reverseRunner', speed: 370, min: 1600, max: 1900 }, { x: 5380, y: 160, kind: 'trapBait', baitX: 5600, speed: 250, min: 5200, max: 5650 }, { x: 7600, y: 170, kind: 'shyVanish', safeSide: 'right' }, { x: 10020, y: 250, kind: 'fakeRunner', min: 9900, max: 10280 }] }
);
