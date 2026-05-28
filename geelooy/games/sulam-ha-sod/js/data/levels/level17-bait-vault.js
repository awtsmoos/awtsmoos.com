// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * The Bait Vault is treasure designed to be ignored.
 *
 * The Awtsmoos fills the vault with deliberate greed traps: boosters point at
 * coins, checkpoints are theater, and the safest line is usually the one that
 * refuses the richer-looking prize. The late curtain punishes chasing the vault
 * eye's coin line instead of reading the path.
 */
export const level17 = L(
  '17 · Bait Vault of Delayed Teeth',
  9900,
  { x: 60, y: 420 },
  P(9600, 135, 44, 90),
  'Treasure is not the path; treasure is where the trap wants your eyes.',
  [P(0, 505, 340, 35), P(540, 455, 120, 20), P(900, 405, 125, 20), P(1280, 350, 125, 20), P(1660, 295, 130, 20), P(2080, 360, 130, 20), P(2500, 430, 135, 20), P(2940, 365, 135, 20), P(3380, 300, 140, 20), P(3820, 365, 140, 20), P(4260, 430, 140, 20), P(4720, 355, 145, 20), P(5200, 285, 145, 20), P(5680, 355, 150, 20), P(6160, 425, 150, 20), P(6660, 345, 160, 20), P(7180, 275, 160, 20), P(7700, 345, 170, 20), P(8240, 415, 170, 20), P(8820, 315, 190, 20), P(9340, 230, 220, 20)],
  [R(1040, 382, 80, 14, -3.3, 620), R(4020, 337, 92, 14, 3.6, 700), R(7440, 317, 100, 14, -4, 820)],
  [T(720, 438, 90, 16, 'commitDrop'), T(1080, 388, 92, 16, 'booster', { dir: 1, boost: 930, lift: 24 }), T(1460, 333, 92, 16, 'falseSpike'), T(1860, 279, 92, 16, 'ice', { duration: 1.5 }), T(2300, 344, 96, 16, 'reverseBooster', { dir: 1, boost: 870 }), T(2740, 414, 96, 16, 'phantom'), T(3180, 349, 96, 16, 'fakeCheckpoint'), T(3600, 284, 98, 16, 'antiSpeed'), T(4480, 414, 100, 16, 'falseSpike'), T(4960, 339, 100, 16, 'commitDrop'), T(5440, 269, 100, 16, 'magnet', { pull: 480 }), T(5920, 339, 100, 16, 'antiJump'), T(6420, 409, 105, 16, 'reverseBooster', { dir: -1, boost: 920 }), T(6940, 329, 105, 16, 'phantom'), T(7460, 259, 110, 16, 'falseSpike'), T(8000, 329, 110, 16, 'commitDrop'), T(8560, 399, 110, 16, 'booster', { dir: 1, boost: 1050, lift: 30 }), T(9120, 299, 115, 16, 'fakeCheckpoint')],
  [C(260, 460), C(575, 415), C(935, 365, 'dinar'), C(1315, 310), C(1695, 255, 'sela'), C(2115, 320), C(2535, 390), C(2975, 325, 'dinar'), C(3415, 260), C(3855, 325, 'sela'), C(4295, 390), C(4755, 315, 'dinar'), C(5235, 245), C(5715, 315, 'sela'), C(6195, 385), C(6695, 305, 'dinar'), C(7215, 235), C(7735, 305, 'sela'), C(8275, 375), C(8860, 275, 'dinar'), C(9380, 190, 'maneh')],
  [C(9480, 190, 'dinar')],
  [S(430, 481, 90, 24, 1, 1, 2), S(1780, 481, 90, 24, 1.3, 1, 2.1), S(3260, 481, 100, 24, 1.8, 1, 2.2), S(4880, 481, 100, 24, 2.1, 1, 2.3), S(6600, 481, 110, 24, 2.5, 1, 2.2), S(8420, 481, 120, 24, 1.9, 1, 2.1)],
  [E(1700, 261, 1640, 1820, 120, 'baitGuard', 'vault keeper'), E(3400, 266, 3340, 3520, 135, 'feign', 'dead toll'), E(5660, 321, 5600, 5820, 150, 'herder', 'spike shepherd'), E(8240, 381, 8180, 8400, 130, 'watcher', 'vault eye'), E(8860, 281, 8800, 9020, 140, 'leaper', 'last leap')],
  [
    G(1080, 340, 140, 120, 'The boost points forward, but the coin path is a trap.', {}),
    G(3180, 300, 150, 120, 'The checkpoint mark is bait for impatience.', {}),
    G(5440, 230, 150, 120, 'The magnetic floor pulls your certainty sideways.', {}),
    G(8460, 330, 120, 120, 'The last reward room lowers delayed teeth.', { spikes: [{ x: 8590, y: 116, w: 72, h: 24, warning: 0.56, duration: 1.1, fallSpeed: 420 }, { x: 8675, y: 146, w: 76, h: 24, warning: 0.7, duration: 1.1, fallSpeed: 450 }, { x: 8765, y: 176, w: 80, h: 24, warning: 0.84, duration: 1.1, fallSpeed: 480 }] }),
    G(9320, 190, 170, 120, 'The last vault opens after ignoring the greedy line.', { openExit: true })
  ],
  ['The vault offers reward rooms shaped like graves.', 'The richest coin is often the least relevant object.', 'The intended route leaves at least one obvious prize behind.'],
  { fakeCoins: [F(1480, 300, 'sela', 'The vault paid in spikes.'), F(4500, 380, 'dinar', 'The side prize was a tooth.'), F(9140, 270, 'maneh', 'The checkpoint reward was a blade.')], trickCoins: [{ x: 1120, y: 350, kind: 'trapBait', baitX: 1470, speed: 240, min: 1050, max: 1500 }, { x: 3600, y: 250, kind: 'reverseRunner', speed: 360, min: 3480, max: 3840 }, { x: 6200, y: 380, kind: 'fakeRunner', min: 6120, max: 6460 }, { x: 8840, y: 275, kind: 'shyVanish', safeSide: 'left' }] }
);
