// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Trust Breaker is a mirror hall that lies with symmetry.
 *
 * The Awtsmoos makes copied shapes disagree: one side is floor, one side is
 * hunger. The player must compare motion, not silhouettes, and must pause when
 * the mirrored coin line starts to look too generous.
 */
export const level16 = L(
  '16 · Trust Breaker Mirror Hall',
  9300,
  { x: 60, y: 420 },
  P(9000, 150, 44, 90),
  'The mirrored route teaches that symmetry is not honesty.',
  [P(0, 505, 330, 35), P(520, 440, 130, 20), P(900, 370, 120, 20), P(1260, 300, 120, 20), P(1660, 370, 120, 20), P(2040, 440, 130, 20), P(2460, 360, 130, 20), P(2880, 290, 130, 20), P(3300, 360, 130, 20), P(3720, 430, 130, 20), P(4160, 350, 140, 20), P(4620, 280, 140, 20), P(5080, 350, 140, 20), P(5540, 420, 140, 20), P(6020, 340, 150, 20), P(6500, 270, 150, 20), P(7000, 340, 160, 20), P(7500, 410, 160, 20), P(8020, 315, 180, 20), P(8580, 245, 200, 20)],
  [R(1120, 342, 82, 14, 3.1, 580), R(3500, 334, 90, 14, -3.5, 640), R(6280, 312, 100, 14, 3.8, 760)],
  [T(700, 424, 95, 16, 'phantom'), T(1080, 354, 95, 16, 'falseSpike'), T(1450, 284, 95, 16, 'commitDrop'), T(1850, 354, 95, 16, 'ice', { duration: 1.4 }), T(2250, 424, 95, 16, 'booster', { dir: 1, boost: 880, lift: 18 }), T(2680, 344, 98, 16, 'falseSpike'), T(3100, 274, 98, 16, 'magnet', { pull: 420 }), T(3940, 414, 98, 16, 'reverseBooster', { dir: 1, boost: 880 }), T(4380, 334, 100, 16, 'phantom'), T(4840, 264, 100, 16, 'commitDrop'), T(5300, 334, 100, 16, 'antiJump'), T(5760, 404, 100, 16, 'fakeCheckpoint'), T(6740, 254, 105, 16, 'falseSpike'), T(7240, 324, 105, 16, 'ice', { duration: 1.5 }), T(7780, 394, 110, 16, 'booster', { dir: -1, boost: 900, lift: 22 }), T(8340, 298, 110, 16, 'commitDrop')],
  [C(250, 460), C(555, 400), C(935, 330, 'dinar'), C(1295, 260), C(1695, 330, 'sela'), C(2075, 400), C(2495, 320), C(2915, 250, 'dinar'), C(3335, 320), C(3755, 390, 'sela'), C(4195, 310), C(4655, 240, 'dinar'), C(5115, 310), C(5575, 380, 'sela'), C(6055, 300), C(6535, 230, 'dinar'), C(7040, 300), C(7540, 370, 'sela'), C(8060, 275), C(8620, 205, 'maneh')],
  [C(8860, 150, 'dinar')],
  [S(410, 481, 80, 24, 1, 1, 2), S(1540, 481, 90, 24, 1.4, 1, 2.2), S(2860, 481, 90, 24, 1.7, 1, 2.1), S(4400, 481, 100, 24, 2.1, 1, 2.4), S(6060, 481, 100, 24, 2.4, 1, 2.2), S(7760, 481, 110, 24, 1.8, 1, 2.1)],
  [E(1280, 266, 1240, 1380, 140, 'feign', 'dead liar'), E(2920, 256, 2860, 3040, 120, 'watcher', 'mirror watcher'), E(5140, 316, 5080, 5260, 130, 'leaper', 'mirror jumper'), E(7540, 376, 7480, 7680, 115, 'herder', 'left shepherd')],
  [
    G(860, 310, 140, 120, 'Left-looking symmetry is bait. Read the shimmer.', {}),
    G(3100, 230, 150, 120, 'The magnet is a hand, not a floor.', {}),
    G(5760, 360, 150, 120, 'A checkpoint image cannot save you.', {}),
    G(7200, 300, 120, 120, 'The mirrored reward line drops matching teeth.', { spikes: [{ x: 7330, y: 116, w: 72, h: 24, warning: 0.56, duration: 1.1, fallSpeed: 420 }, { x: 7415, y: 146, w: 76, h: 24, warning: 0.7, duration: 1.1, fallSpeed: 450 }, { x: 7505, y: 176, w: 80, h: 24, warning: 0.84, duration: 1.1, fallSpeed: 480 }] }),
    G(8580, 205, 160, 120, 'The final mirror opens only after distrust.', { openExit: true })
  ],
  ['The hall copies shapes but not truth.', 'The player must compare motion, not silhouettes.', 'The mirror is beaten by hesitating when both sides look identical.'],
  { fakeCoins: [F(1100, 320, 'sela', 'The mirror coin was a fang.'), F(6760, 220, 'maneh', 'The mirrored reward betrayed its shine.')], trickCoins: [{ x: 2300, y: 390, kind: 'trapBait', baitX: 2500, speed: 220, min: 2200, max: 2600 }, { x: 4800, y: 235, kind: 'reverseRunner', speed: 330, min: 4680, max: 5000 }, { x: 6500, y: 230, kind: 'shyVanish', safeSide: 'right' }, { x: 8350, y: 270, kind: 'fakeRunner', min: 8280, max: 8540 }] }
);
