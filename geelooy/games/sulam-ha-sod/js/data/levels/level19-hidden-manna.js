// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Hidden Manna forces vertical greed and enemy mercy.
 *
 * The Awtsmoos hides required coins above the comfortable horizon and inside
 * living guards. The player must climb, wait for the camera to breathe upward,
 * stomp the coin-swallowing watchers, and then descend without trusting the
 * platforms that look most centered.
 */
export const level19 = L(
  '19 · Hidden Manna Above the Teeth',
  11200,
  { x: 60, y: 420 },
  P(10880, 160, 44, 90),
  'Some coins are above sight; some are inside enemies. All are required.',
  [P(0, 505, 350, 35), P(520, 450, 120, 20), P(880, 385, 120, 20), P(1220, 315, 120, 20), P(1580, 245, 130, 20), P(1970, 175, 130, 20), P(2380, 260, 140, 20), P(2820, 340, 150, 20), P(3260, 420, 150, 20), P(3720, 350, 155, 20), P(4180, 280, 155, 20), P(4660, 210, 160, 20), P(5160, 300, 160, 20), P(5680, 390, 170, 20), P(6200, 320, 170, 20), P(6720, 250, 180, 20), P(7260, 170, 180, 20), P(7840, 260, 185, 20), P(8400, 350, 190, 20), P(9000, 280, 190, 20), P(9600, 210, 200, 20), P(10240, 175, 230, 20)],
  [R(700, 424, 82, 14, 3.2, 620), R(3560, 392, 94, 14, -3.7, 760), R(7420, 226, 105, 14, 4.1, 860)],
  [T(1040, 369, 90, 16, 'falseSpike'), T(1420, 299, 90, 16, 'ice', { duration: 1.45 }), T(1810, 229, 92, 16, 'booster', { dir: 1, boost: 980, lift: 34 }), T(2220, 159, 92, 16, 'phantom'), T(2640, 244, 95, 16, 'commitDrop', { reform: 2.4 }), T(3060, 324, 96, 16, 'reverseBooster', { dir: 1, boost: 900 }), T(4500, 264, 98, 16, 'falseSpike'), T(4940, 194, 100, 16, 'magnet', { pull: 520 }), T(5440, 284, 100, 16, 'antiJump'), T(5940, 374, 102, 16, 'booster', { dir: -1, boost: 980, lift: 28 }), T(6480, 304, 105, 16, 'phantom'), T(7000, 234, 105, 16, 'ice', { duration: 1.5 }), T(7600, 154, 110, 16, 'falseSpike'), T(8140, 244, 110, 16, 'commitDrop', { reform: 2.3 }), T(8760, 334, 112, 16, 'fakeCheckpoint'), T(9340, 264, 114, 16, 'reverseBooster', { dir: -1, boost: 960 }), T(9900, 194, 116, 16, 'booster', { dir: 1, boost: 1080, lift: 30 })],
  [C(260, 460), C(555, 410), C(915, 345, 'dinar'), C(1255, 275), C(1615, 205, 'sela'), C(2005, 135, 'dinar'), C(2420, 220), C(2860, 300, 'sela'), C(3300, 380), C(3760, 310, 'dinar'), C(4220, 240), C(4700, 170, 'sela'), C(5200, 260), C(5720, 350, 'dinar'), C(6240, 280), C(6760, 210, 'sela'), C(7300, 130, 'maneh'), C(7880, 220), C(8440, 310, 'dinar'), C(9040, 240), C(9640, 170, 'sela'), C(10300, 135, 'maneh')],
  [C(10640, 135, 'dinar')],
  [S(390, 481, 90, 24, 1, 1, 2), S(3120, 481, 100, 24, 1.7, 1, 2.2), S(5600, 481, 110, 24, 2.2, 1, 2.2), S(8300, 481, 120, 24, 1.8, 1, 2.1), S(10100, 481, 130, 24, 2.4, 1, 2.2)],
  [E(2360, 226, 2320, 2500, 125, 'scroll', 'manna scroll', { dropCoin: 'dinar' }), E(4700, 176, 4640, 4820, 140, 'watcher', 'coin-eyed watcher', { dropCoin: 'sela' }), E(6240, 286, 6180, 6380, 130, 'leaper', 'high leaper'), E(8440, 316, 8380, 8580, 130, 'feign', 'manna corpse', { dropCoin: 'dinar' }), E(9640, 176, 9580, 9780, 145, 'herder', 'summit shepherd')],
  [
    G(1160, 240, 140, 130, 'The first high coin is not decoration. Climb.', {}),
    G(3160, 300, 120, 120, 'The reverse boost blocks autopilot ascent.', {}),
    G(5200, 220, 120, 120, 'A swallowed coin requires a stomp, not a sprint.', {}),
    G(7600, 110, 130, 120, 'The summit drops a three-tooth warning.', { spikes: [{ x: 7730, y: 58, w: 72, h: 24, warning: 0.56, duration: 1.1, fallSpeed: 430 }, { x: 7815, y: 88, w: 76, h: 24, warning: 0.7, duration: 1.1, fallSpeed: 460 }, { x: 7905, y: 118, w: 80, h: 24, warning: 0.84, duration: 1.1, fallSpeed: 490 }] }),
    G(10200, 120, 160, 130, 'The hidden manna opens the door only when all coins are seen.', { openExit: true })
  ],
  ['Hidden coins make the camera matter.', 'A living enemy can be a locked coin chest.', 'The correct route climbs, stomps, descends, and refuses centered bait.'],
  { fakeCoins: [F(1080, 330, 'dinar', 'The lower manna was a spike.'), F(7600, 120, 'maneh', 'The summit reward wore teeth.'), F(9360, 230, 'sela', 'The reverse path coin was a blade.')], trickCoins: [{ x: 1700, y: 200, kind: 'trapBait', baitX: 1940, speed: 240, min: 1600, max: 1980 }, { x: 4380, y: 235, kind: 'reverseRunner', speed: 360, min: 4260, max: 4580 }, { x: 6940, y: 210, kind: 'shyVanish', safeSide: 'left' }, { x: 9400, y: 230, kind: 'fakeRunner', min: 9300, max: 9620 }] }
);
