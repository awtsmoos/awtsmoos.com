// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Vertical Vault makes the old habit of running right worthless.
 *
 * The Awtsmoos stacks the vault like a question. The player must climb to high
 * coins, stomp two vault guards, pass upward through one-way sky rungs, then
 * descend through boosters that punish greed. Every line is placed by hand.
 */
export const level23 = L(
  '23 · Vertical Vault of Returning Sparks',
  13200,
  { x: 60, y: 420 },
  P(12820, 120, 44, 90),
  'The vault opens upward first, then backward, then right.',
  [P(0, 505, 340, 35), P(520, 445, 120, 20), P(900, 375, 120, 20), P(1300, 295, 125, 20), P(1720, 215, 130, 20), P(2160, 135, 135, 20), P(2640, 215, 140, 20), P(3140, 295, 145, 20), P(3660, 375, 150, 20), P(4200, 305, 155, 20), P(4760, 235, 160, 20), P(5340, 155, 165, 20), P(5940, 235, 170, 20), P(6560, 315, 175, 20), P(7200, 235, 180, 20), P(7860, 155, 185, 20), P(8540, 75, 190, 20), P(9240, 165, 195, 20), P(9960, 255, 200, 20), P(10700, 185, 205, 20), P(11460, 105, 220, 20), P(12240, 145, 230, 20)],
  [R(740, 418, 82, 14, 3.7, 720), R(3960, 348, 96, 14, -4.2, 830), R(8300, 130, 108, 14, 4.6, 960), R(11220, 158, 114, 14, -4.6, 980)],
  [T(1080, 359, 90, 16, 'falseSpike'), T(1500, 279, 92, 16, 'ice', { duration: 1.65 }), T(1940, 199, 92, 16, 'booster', { dir: 1, boost: 1080, lift: 38 }), T(2400, 119, 94, 16, 'phantom'), T(2460, 174, 92, 14, 'oneWay'), T(2880, 199, 96, 16, 'commitDrop', { reform: 2.4 }), T(3380, 279, 98, 16, 'reverseBooster', { dir: 1, boost: 980 }), T(4520, 289, 100, 16, 'falseSpike'), T(5100, 219, 100, 16, 'magnet', { pull: 580 }), T(5700, 139, 102, 16, 'antiJump'), T(6320, 219, 104, 16, 'booster', { dir: -1, boost: 1080, lift: 32 }), T(6960, 299, 106, 16, 'fakeCheckpoint'), T(7620, 219, 108, 16, 'phantom'), T(8040, 104, 96, 14, 'oneWay'), T(8300, 139, 110, 16, 'ice', { duration: 1.7 }), T(9020, 59, 112, 16, 'falseSpike'), T(9740, 149, 114, 16, 'commitDrop', { reform: 2.5 }), T(10480, 239, 116, 16, 'reverseBooster', { dir: -1, boost: 1040 }), T(11240, 169, 118, 16, 'booster', { dir: 1, boost: 1180, lift: 36 }), T(12020, 89, 120, 16, 'antiSpeed'), T(12480, 96, 96, 14, 'oneWay')],
  [C(260, 460), C(555, 405), C(940, 335, 'dinar'), C(1340, 255), C(1760, 175, 'sela'), C(2200, 95), C(2680, 175, 'maneh'), C(3180, 255), C(3700, 335, 'dinar'), C(4240, 265), C(4800, 195, 'sela'), C(5380, 115), C(5980, 195, 'dinar'), C(6600, 275), C(7240, 195, 'sela'), C(7900, 115), C(8580, 35, 'maneh'), C(9280, 125), C(10000, 215, 'dinar'), C(10740, 145), C(11500, 65, 'sela'), C(12280, 105, 'maneh')],
  [C(12640, 100, 'dinar')],
  [S(380, 481, 90, 24, 1, 1, 2), S(3600, 481, 100, 24, 1.7, 1, 2.2), S(6400, 481, 110, 24, 2.1, 1, 2.2), S(9200, 481, 120, 24, 1.8, 1, 2.1), S(12000, 481, 130, 24, 2.4, 1, 2.2)],
  [E(2680, 181, 2620, 2800, 130, 'watcher', 'vault keeper', { dropCoin: 'sela' }), E(5380, 121, 5320, 5520, 140, 'scroll', 'vault receipt', { dropCoin: 'dinar' }), E(7240, 201, 7180, 7400, 140, 'leaper', 'vertical leaper'), E(10000, 221, 9940, 10180, 150, 'baitGuard', 'vault bait guard'), E(11500, 71, 11440, 11680, 135, 'feign', 'sleeping lock')],
  [G(1080, 255, 130, 130, 'The first vault tooth is shaped like a platform.', {}), G(2320, 130, 150, 130, 'Jump through the thin rung from below; land only after falling.', {}), G(2680, 120, 140, 120, 'A keeper holds a mandatory coin above the line.', {}), G(5940, 90, 140, 130, 'The vault ceiling releases three falling locks.', { spikes: [{ x: 6080, y: 42, w: 72, h: 24, warning: 0.55, duration: 1.1, fallSpeed: 430 }, { x: 6170, y: 72, w: 76, h: 24, warning: 0.7, duration: 1.1, fallSpeed: 460 }, { x: 6265, y: 102, w: 80, h: 24, warning: 0.85, duration: 1.1, fallSpeed: 490 }] }), G(8580, 20, 140, 120, 'The highest crown is real only if approached slowly.', {}), G(12020, 70, 160, 130, 'The vault gate opens after the return path.', { openExit: true })],
  ['The vault is vertical memory.', 'Two guards are coin chests with eyes.', 'The correct path is a spiral, not a sprint.'],
  { fakeCoins: [F(1080, 320, 'dinar', 'The first vault coin was a tooth.'), F(9040, 32, 'maneh', 'The top fake crown shattered your account.'), F(12040, 50, 'sela', 'The final vault sparkle was a trap.')], trickCoins: [{ x: 1760, y: 175, kind: 'reverseRunner', speed: 390, min: 1620, max: 1940 }, { x: 5600, y: 115, kind: 'trapBait', baitX: 5940, speed: 270, min: 5440, max: 6000 }, { x: 7900, y: 115, kind: 'shyVanish', safeSide: 'right' }, { x: 10440, y: 215, kind: 'fakeRunner', min: 10280, max: 10640 }] }
);
