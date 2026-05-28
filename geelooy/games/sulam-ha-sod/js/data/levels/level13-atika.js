// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Atika is old momentum returning as a spiral.
 *
 * The Awtsmoos makes the ancient shove remember the player's first direction.
 * Autopilot dies here: the intended route brakes after the second boost, waits
 * for the scroll, then uses a reverse correction before the final spiral opens.
 */
export const level13 = L(
  '13 · Atika Ancient Boost Spiral',
  7400,
  { x: 60, y: 420 },
  P(7140, 190, 44, 90),
  'Atika is old momentum returning from before the jump.',
  [P(0, 505, 320, 35), P(520, 455, 110, 20), P(840, 400, 110, 20), P(1160, 345, 115, 20), P(1480, 290, 120, 20), P(1820, 235, 125, 20), P(2180, 300, 140, 20), P(2560, 365, 140, 20), P(2940, 425, 145, 20), P(3340, 360, 150, 20), P(3740, 295, 150, 20), P(4140, 230, 150, 20), P(4560, 300, 160, 20), P(4980, 370, 160, 20), P(5420, 310, 170, 20), P(5860, 250, 170, 20), P(6320, 320, 190, 20), P(6780, 260, 200, 20)],
  [R(700, 430, 80, 14, 2.8, 480), R(2380, 338, 85, 14, -3.1, 560), R(3960, 272, 92, 14, 3.3, 630), R(6120, 292, 100, 14, -3.4, 680)],
  [T(980, 384, 80, 16, 'ice', { duration: 1.25 }), T(1300, 329, 90, 16, 'booster', { dir: 1, boost: 1040, lift: 30 }), T(1660, 274, 85, 16, 'falseSpike'), T(2020, 219, 90, 16, 'phantom'), T(2760, 349, 90, 16, 'booster', { dir: 1, boost: 1080, lift: 35 }), T(3180, 404, 84, 16, 'falseSpike'), T(3540, 344, 90, 16, 'ice', { duration: 1.35 }), T(4360, 214, 95, 16, 'falseSpike'), T(5200, 354, 90, 16, 'booster', { dir: 1, boost: 1120, lift: 25 }), T(5760, 234, 90, 16, 'phantom'), T(6060, 234, 95, 16, 'phantom'), T(6580, 304, 100, 16, 'ice', { duration: 1.45 }), T(6900, 244, 92, 16, 'reverseBooster', { dir: 1, boost: 880 })],
  [C(230, 460), C(560, 415), C(880, 360, 'dinar'), C(1200, 305), C(1520, 250, 'sela'), C(1860, 195), C(2220, 260, 'dinar'), C(2600, 325), C(2980, 385, 'sela'), C(3380, 320), C(3780, 255, 'dinar'), C(4180, 190), C(5020, 330), C(5460, 270, 'sela'), C(5900, 210), C(6360, 280, 'dinar'), C(6820, 220, 'maneh')],
  [C(6920, 190, 'dinar')],
  [S(350, 481, 80, 24, 1, 1, 2), S(2100, 481, 90, 24, 1.4, 1, 2.3), S(3160, 481, 90, 24, 1.8, 1, 2.4), S(4740, 481, 90, 24, 2.1, 1.1, 2.4), S(6260, 481, 100, 24, 2.4, 1.1, 2.3), S(7020, 486, 100, 24, 1.1, 1, 2)],
  [E(2600, 331, 2560, 2700, 150, 'scroll', 'ancient scroll'), E(5460, 276, 5420, 5580, 100, 'golem', 'ancient shell'), E(6360, 286, 6300, 6520, 145, 'watcher', 'old eye')],
  [
    G(1300, 280, 130, 120, 'Atika remembers your first direction.', {}),
    G(5200, 310, 150, 120, 'Ancient boost: jump before the shove completes.', {}),
    G(5900, 210, 110, 120, 'The old spiral drops teeth where speed refuses memory.', { spikes: [{ x: 6020, y: 118, w: 72, h: 24, warning: 0.56, duration: 1.1, fallSpeed: 430 }, { x: 6105, y: 148, w: 76, h: 24, warning: 0.7, duration: 1.1, fallSpeed: 460 }, { x: 6195, y: 178, w: 80, h: 24, warning: 0.84, duration: 1.1, fallSpeed: 490 }] }),
    G(6740, 230, 150, 120, 'The ancient spiral opens.', { openExit: true })
  ],
  ['Atika is momentum with memory.', 'Older than control is drift.', 'The final boost is survived by reversing the inherited direction.'],
  { fakeCoins: [F(1700, 235, 'sela', 'The ancient coin remembered teeth.'), F(4400, 175, 'dinar', 'Atika hid a bite in plain sight.'), F(6860, 220, 'maneh', 'The old crown was a spike fossil.')], trickCoins: [{ x: 900, y: 330, kind: 'runner', speed: 240, min: 820, max: 1180 }, { x: 2500, y: 300, kind: 'panicRunner', speed: 340, min: 2400, max: 2900 }, { x: 3600, y: 240, kind: 'iceRunner', speed: 420, dir: 1, min: 3500, max: 4100 }, { x: 5200, y: 250, kind: 'fakeRunner', min: 5150, max: 5450 }] }
);
