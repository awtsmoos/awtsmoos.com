// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * No Autopilot Crown is the thesis chamber.
 *
 * The Awtsmoos makes the final level judge rhythm itself. Holding right and
 * jumping repeatedly should fail: the player must stop, reverse, observe trap
 * tells, and choose which coins to abandon. Every cruelty here is hand-placed.
 */
export const level18 = L(
  '18 · No Autopilot Crown',
  10600,
  { x: 60, y: 420 },
  P(10280, 120, 44, 90),
  'Holding right is an offering to the spikes. Stop, reverse, observe, then move.',
  [P(0, 505, 350, 35), P(560, 455, 120, 20), P(940, 390, 125, 20), P(1320, 325, 125, 20), P(1700, 390, 130, 20), P(2120, 455, 130, 20), P(2560, 375, 135, 20), P(3000, 310, 135, 20), P(3440, 375, 140, 20), P(3900, 440, 140, 20), P(4380, 360, 145, 20), P(4860, 295, 145, 20), P(5360, 360, 150, 20), P(5860, 425, 150, 20), P(6380, 345, 155, 20), P(6900, 280, 155, 20), P(7440, 345, 165, 20), P(7980, 410, 165, 20), P(8540, 330, 175, 20), P(9120, 260, 185, 20), P(9720, 200, 220, 20)],
  [R(1180, 362, 86, 14, 3.6, 680), R(3680, 347, 94, 14, -4, 740), R(6640, 317, 105, 14, 4.2, 840), R(9360, 232, 110, 14, -4.4, 900)],
  [T(760, 438, 90, 16, 'reverseBooster', { dir: 1, boost: 900 }), T(1120, 373, 92, 16, 'falseSpike'), T(1500, 309, 92, 16, 'commitDrop'), T(1900, 373, 94, 16, 'ice', { duration: 1.55 }), T(2340, 438, 94, 16, 'booster', { dir: -1, boost: 880, lift: 28 }), T(2780, 359, 96, 16, 'phantom'), T(3220, 294, 96, 16, 'antiSpeed'), T(3660, 359, 98, 16, 'fakeCheckpoint'), T(4140, 424, 98, 16, 'falseSpike'), T(4620, 344, 100, 16, 'magnet', { pull: 520 }), T(5120, 279, 100, 16, 'commitDrop'), T(5620, 344, 102, 16, 'antiJump'), T(6120, 409, 102, 16, 'reverseBooster', { dir: -1, boost: 980 }), T(6640, 329, 105, 16, 'phantom'), T(7180, 264, 105, 16, 'falseSpike'), T(7720, 329, 108, 16, 'commitDrop'), T(8280, 394, 108, 16, 'ice', { duration: 1.6 }), T(8860, 314, 112, 16, 'booster', { dir: 1, boost: 1120, lift: 34 }), T(9460, 244, 112, 16, 'fakeCheckpoint'), T(10000, 184, 120, 16, 'falseSpike')],
  [C(270, 460), C(595, 415), C(975, 350, 'dinar'), C(1355, 285), C(1735, 350, 'sela'), C(2155, 415), C(2595, 335), C(3035, 270, 'dinar'), C(3475, 335), C(3935, 400, 'sela'), C(4415, 320), C(4895, 255, 'dinar'), C(5395, 320), C(5895, 385, 'sela'), C(6415, 305), C(6935, 240, 'dinar'), C(7475, 305), C(8015, 370, 'sela'), C(8575, 290), C(9155, 220, 'dinar'), C(9760, 160, 'maneh')],
  [C(10140, 140, 'dinar')],
  [S(450, 481, 90, 24, 1, 1, 2), S(1900, 481, 100, 24, 1.3, 1, 2), S(3500, 481, 100, 24, 1.8, 1, 2.2), S(5260, 481, 110, 24, 2.2, 1, 2.3), S(7140, 481, 120, 24, 2.6, 1, 2.2), S(9200, 481, 130, 24, 2, 1, 2.1)],
  [E(1340, 291, 1280, 1460, 150, 'watcher', 'crown eye'), E(3020, 276, 2960, 3160, 135, 'feign', 'floor corpse'), E(4880, 261, 4820, 5020, 150, 'baitGuard', 'reward jailer'), E(6380, 311, 6320, 6560, 150, 'herder', 'teeth shepherd'), E(8540, 296, 8480, 8720, 155, 'leaper', 'crown leaper'), E(9180, 226, 9120, 9360, 140, 'gravity', 'final refusal')],
  [
    G(940, 330, 150, 120, 'The obvious jump is wrong. Reverse after the shimmer.', {}),
    G(3660, 320, 150, 120, 'The fake checkpoint marks the worst place to rest.', {}),
    G(6120, 370, 160, 120, 'The reverse booster is the intended brake.', {}),
    G(9000, 220, 120, 120, 'The Crown drops punishment on the final autopilot dash.', { spikes: [{ x: 9130, y: 100, w: 72, h: 24, warning: 0.52, duration: 1.1, fallSpeed: 440 }, { x: 9220, y: 132, w: 76, h: 24, warning: 0.66, duration: 1.1, fallSpeed: 470 }, { x: 9315, y: 164, w: 80, h: 24, warning: 0.8, duration: 1.1, fallSpeed: 500 }] }),
    G(9460, 210, 170, 120, 'Do not trust the last crown-shaped platform.', {}),
    G(10080, 150, 170, 120, 'The Crown opens to players who broke autopilot.', { openExit: true })
  ],
  ['The Crown counts repeated direction as arrogance.', 'Observation is the final movement mechanic.', 'The final door is earned by abandoning the rhythm that worked earlier.'],
  { fakeCoins: [F(1140, 340, 'sela', 'The crown glitter was an execution.'), F(4160, 390, 'dinar', 'The rest-point reward was teeth.'), F(10020, 150, 'maneh', 'The final crown was a spike silhouette.')], trickCoins: [{ x: 760, y: 410, kind: 'shyVanish', safeSide: 'right' }, { x: 2360, y: 405, kind: 'trapBait', baitX: 2680, speed: 260, min: 2280, max: 2740 }, { x: 5120, y: 250, kind: 'reverseRunner', speed: 380, min: 5020, max: 5340 }, { x: 7200, y: 235, kind: 'fakeRunner', min: 7120, max: 7380 }, { x: 9160, y: 190, kind: 'trapBait', baitX: 9460, speed: 250, min: 9060, max: 9520 }] }
);
