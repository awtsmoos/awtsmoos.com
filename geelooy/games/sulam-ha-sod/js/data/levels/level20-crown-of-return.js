// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Crown of Return is a final vertical switchback.
 *
 * The Awtsmoos makes the top of the level a trap and a requirement. Coins hide
 * in the sky, one coin is swallowed by a stompable enemy, and the exit only
 * accepts a player who broke the old habit of running right across the floor.
 */
export const level20 = L(
  '20 · Crown of Return Sky-Lock',
  11800,
  { x: 60, y: 420 },
  P(11480, 120, 44, 90),
  'The final crown is not rightward. It is upward, backward, and earned.',
  [P(0, 505, 350, 35), P(540, 450, 120, 20), P(900, 390, 120, 20), P(1260, 330, 125, 20), P(1640, 260, 125, 20), P(2040, 190, 135, 20), P(2460, 115, 135, 20), P(2920, 205, 145, 20), P(3380, 295, 145, 20), P(3840, 385, 150, 20), P(4320, 315, 150, 20), P(4800, 245, 155, 20), P(5300, 175, 155, 20), P(5820, 255, 160, 20), P(6340, 340, 165, 20), P(6880, 265, 170, 20), P(7420, 185, 175, 20), P(7980, 100, 175, 20), P(8560, 190, 185, 20), P(9160, 280, 190, 20), P(9800, 210, 200, 20), P(10460, 150, 210, 20), P(11100, 180, 230, 20)],
  [R(760, 424, 82, 14, 3.3, 650), R(3200, 266, 95, 14, -3.9, 780), R(6100, 308, 105, 14, 4.2, 880), R(10160, 182, 112, 14, -4.4, 900)],
  [T(1080, 374, 90, 16, 'falseSpike'), T(1450, 314, 92, 16, 'reverseBooster', { dir: 1, boost: 920 }), T(1840, 244, 92, 16, 'ice', { duration: 1.55 }), T(2260, 174, 94, 16, 'booster', { dir: 1, boost: 1020, lift: 36 }), T(2700, 99, 94, 16, 'phantom'), T(3160, 189, 96, 16, 'commitDrop', { reform: 2.4 }), T(3640, 279, 98, 16, 'falseSpike'), T(4560, 299, 100, 16, 'magnet', { pull: 540 }), T(5060, 229, 100, 16, 'antiSpeed'), T(5560, 159, 102, 16, 'booster', { dir: -1, boost: 1000, lift: 30 }), T(6600, 324, 105, 16, 'fakeCheckpoint'), T(7160, 249, 105, 16, 'phantom'), T(7700, 169, 108, 16, 'ice', { duration: 1.6 }), T(8260, 84, 110, 16, 'falseSpike'), T(8860, 174, 110, 16, 'reverseBooster', { dir: -1, boost: 980 }), T(9500, 264, 112, 16, 'commitDrop', { reform: 2.4 }), T(10140, 194, 114, 16, 'booster', { dir: 1, boost: 1150, lift: 35 }), T(10820, 134, 116, 16, 'antiJump')],
  [C(260, 460), C(575, 410), C(940, 350, 'dinar'), C(1300, 290), C(1680, 220, 'sela'), C(2080, 150), C(2500, 75, 'maneh'), C(2960, 165, 'dinar'), C(3420, 255), C(3880, 345, 'sela'), C(4360, 275), C(4840, 205, 'dinar'), C(5340, 135), C(5860, 215, 'sela'), C(6380, 300), C(6920, 225, 'dinar'), C(7460, 145), C(8020, 60, 'maneh'), C(8600, 150), C(9200, 240, 'sela'), C(9840, 170), C(10500, 110, 'dinar'), C(11140, 140, 'maneh')],
  [C(11280, 140, 'dinar')],
  [S(410, 481, 90, 24, 1, 1, 2), S(3060, 481, 100, 24, 1.6, 1, 2.2), S(5220, 481, 110, 24, 2.1, 1, 2.2), S(7600, 481, 120, 24, 1.8, 1, 2.1), S(10080, 481, 130, 24, 2.4, 1, 2.2)],
  [E(2500, 81, 2440, 2600, 105, 'watcher', 'crown watcher', { dropCoin: 'sela' }), E(4820, 211, 4760, 4960, 140, 'leaper', 'return leaper'), E(6380, 306, 6320, 6520, 130, 'feign', 'false corpse', { dropCoin: 'dinar' }), E(8020, 66, 7960, 8160, 120, 'scroll', 'sky scroll', { dropCoin: 'dinar' }), E(9200, 246, 9140, 9360, 145, 'gravity', 'low refusal'), E(10500, 116, 10440, 10660, 145, 'baitGuard', 'final bait guard')],
  [
    G(1200, 260, 130, 130, 'The crown begins with a reversal, not speed.', {}),
    G(2500, 70, 130, 120, 'A required coin is above the old camera line.', {}),
    G(4700, 170, 130, 120, 'Enemy-stomach coins count as real coins.', {}),
    G(8000, 50, 140, 120, 'The sky crown drops its warning teeth.', { spikes: [{ x: 8140, y: 35, w: 72, h: 24, warning: 0.56, duration: 1.1, fallSpeed: 430 }, { x: 8230, y: 65, w: 76, h: 24, warning: 0.7, duration: 1.1, fallSpeed: 460 }, { x: 8325, y: 95, w: 80, h: 24, warning: 0.84, duration: 1.1, fallSpeed: 490 }] }),
    G(10880, 100, 170, 130, 'The final crown opens only after every visible and swallowed coin.', { openExit: true })
  ],
  ['The last chamber is a vertical contract.', 'Some enemies are locked chests with teeth.', 'The final answer is up, back, down, and only then right.'],
  { fakeCoins: [F(1100, 335, 'sela', 'The first crown glint was a spike.'), F(8260, 52, 'maneh', 'The highest glitter was a crown of teeth.'), F(10860, 102, 'dinar', 'The final anti-jump gift was bait.')], trickCoins: [{ x: 1720, y: 205, kind: 'reverseRunner', speed: 360, min: 1600, max: 1900 }, { x: 5300, y: 135, kind: 'trapBait', baitX: 5560, speed: 250, min: 5200, max: 5620 }, { x: 7560, y: 145, kind: 'shyVanish', safeSide: 'right' }, { x: 10040, y: 170, kind: 'fakeRunner', min: 9920, max: 10240 }, { x: 11100, y: 140, kind: 'trapBait', baitX: 11360, speed: 270, min: 11000, max: 11420 }] }
);
