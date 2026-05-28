// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Mirror Market sells left and right as unreliable words.
 *
 * The Awtsmoos bends the stall awnings into double meanings. Coins above the
 * route are honest, centered coins are often false, and the safest-looking
 * mirror path collapses unless the player reverses rhythm.
 */
export const level22 = L(
  '22 · Mirror Market of False Bargains',
  12800,
  { x: 60, y: 420 },
  P(12420, 170, 44, 90),
  'A bargain facing right may only open by stepping left.',
  [P(0, 505, 340, 35), P(520, 450, 120, 20), P(860, 385, 120, 20), P(1220, 315, 125, 20), P(1600, 235, 130, 20), P(2020, 155, 135, 20), P(2460, 235, 140, 20), P(2940, 315, 145, 20), P(3440, 395, 150, 20), P(3980, 325, 155, 20), P(4540, 255, 160, 20), P(5120, 185, 165, 20), P(5720, 265, 170, 20), P(6340, 345, 175, 20), P(6980, 275, 180, 20), P(7640, 205, 185, 20), P(8320, 125, 190, 20), P(9020, 215, 195, 20), P(9740, 305, 200, 20), P(10480, 235, 205, 20), P(11240, 165, 220, 20), P(12000, 205, 230, 20)],
  [R(700, 424, 82, 14, -3.5, 690), R(3700, 366, 92, 14, 4.1, 810), R(8060, 170, 105, 14, -4.4, 920), R(11020, 198, 112, 14, 4.5, 940)],
  [T(1040, 369, 90, 16, 'falseSpike'), T(1420, 299, 92, 16, 'reverseBooster', { dir: 1, boost: 980 }), T(1820, 219, 92, 16, 'ice', { duration: 1.6 }), T(2260, 139, 94, 16, 'booster', { dir: 1, boost: 1060, lift: 36 }), T(2700, 219, 96, 16, 'phantom'), T(3180, 299, 98, 16, 'commitDrop', { reform: 2.35 }), T(4300, 309, 100, 16, 'falseSpike'), T(4860, 239, 100, 16, 'magnet', { pull: 560 }), T(5440, 169, 102, 16, 'antiJump'), T(6060, 249, 104, 16, 'booster', { dir: -1, boost: 1060, lift: 30 }), T(6700, 329, 106, 16, 'fakeCheckpoint'), T(7360, 259, 108, 16, 'phantom'), T(8020, 189, 110, 16, 'ice', { duration: 1.6 }), T(8740, 109, 112, 16, 'falseSpike'), T(9460, 199, 114, 16, 'commitDrop', { reform: 2.5 }), T(10180, 289, 116, 16, 'reverseBooster', { dir: -1, boost: 1000 }), T(10940, 219, 118, 16, 'booster', { dir: 1, boost: 1150, lift: 35 }), T(11700, 149, 120, 16, 'antiSpeed')],
  [C(260, 460), C(555, 410), C(900, 345, 'dinar'), C(1260, 275), C(1640, 195, 'sela'), C(2060, 115), C(2500, 195, 'maneh'), C(2980, 275), C(3480, 355, 'dinar'), C(4020, 285), C(4580, 215, 'sela'), C(5160, 145), C(5760, 225, 'dinar'), C(6380, 305), C(7020, 235, 'sela'), C(7680, 165), C(8360, 85, 'maneh'), C(9060, 175), C(9780, 265, 'dinar'), C(10520, 195), C(11280, 125, 'sela'), C(12040, 165, 'maneh')],
  [C(12280, 165, 'dinar')],
  [S(380, 481, 90, 24, 1, 1, 2), S(3300, 481, 100, 24, 1.7, 1, 2.2), S(6200, 481, 110, 24, 2.1, 1, 2.2), S(9000, 481, 120, 24, 1.8, 1, 2.1), S(11600, 481, 130, 24, 2.4, 1, 2.2)],
  [E(2500, 201, 2440, 2620, 128, 'feign', 'mirror corpse', { dropCoin: 'dinar' }), E(5160, 151, 5100, 5300, 138, 'watcher', 'stall watcher', { dropCoin: 'sela' }), E(7020, 241, 6960, 7160, 135, 'herder', 'mirror herder'), E(9780, 271, 9720, 9960, 150, 'leaper', 'awning leaper'), E(11280, 131, 11220, 11440, 130, 'scroll', 'receipt mirror')],
  [G(1040, 275, 130, 130, 'The left mirror is safer than the right mirror.', {}), G(2500, 150, 140, 120, 'One market corpse hides a required coin.', {}), G(5700, 120, 140, 130, 'Three awnings drop when greed walks straight.', { spikes: [{ x: 5840, y: 72, w: 72, h: 24, warning: 0.55, duration: 1.1, fallSpeed: 430 }, { x: 5930, y: 102, w: 76, h: 24, warning: 0.7, duration: 1.1, fallSpeed: 460 }, { x: 6025, y: 132, w: 80, h: 24, warning: 0.85, duration: 1.1, fallSpeed: 490 }] }), G(8360, 65, 140, 120, 'The honest crown is high and off rhythm.', {}), G(11740, 110, 160, 130, 'The exit bargain is paid in reversals.', { openExit: true })],
  ['The market mirrors the hand that rushes.', 'The cheap-looking path costs the most.', 'One enemy sells a required coin from its stomach.'],
  { fakeCoins: [F(1040, 330, 'dinar', 'The mirrored discount had teeth.'), F(8760, 82, 'maneh', 'The high reflected crown was false.'), F(11720, 100, 'sela', 'The final stall was a blade.')], trickCoins: [{ x: 1680, y: 195, kind: 'reverseRunner', speed: 380, min: 1540, max: 1900 }, { x: 5360, y: 145, kind: 'trapBait', baitX: 5700, speed: 260, min: 5200, max: 5750 }, { x: 7720, y: 165, kind: 'shyVanish', safeSide: 'left' }, { x: 10100, y: 260, kind: 'fakeRunner', min: 9900, max: 10300 }] }
);
