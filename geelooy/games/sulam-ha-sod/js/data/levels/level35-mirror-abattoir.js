// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Mirror Abattoir of Remembered Floors is rewritten by hand as a harsher but fair late-game court.
 *
 * Chapter 35: The Awtsmoos tears certainty open like iron cloth. Fake coins
 * glitter with room to refuse them, fake platforms move with visible intent,
 * safe-spike bridges teach reversal, proximity teeth warn before judgment, and
 * every carrier enemy holds a counted spark. The chamber is sharper now, but
 * the route stays readable.
 */
export const level35 = L(
  '35 · Mirror Abattoir of Remembered Floors',
  20280,
  { x: 60, y: 420 },
  P(20000, 112, 52, 90),
  'The second jump is judged by the first mistake.',
  [
  P(0, 505, 400, 35),
  P(620, 444, 210, 24),
  P(1090, 374, 234, 24),
  P(1598, 304, 258, 24),
  P(2144, 234, 282, 24),
  P(2614, 164, 210, 24),
  P(3122, 94, 234, 24),
  P(3668, 174, 258, 24),
  P(4138, 254, 282, 24),
  P(4646, 334, 210, 24),
  P(5192, 264, 234, 24),
  P(5662, 194, 258, 24),
  P(6170, 124, 282, 24),
  P(6716, 204, 210, 24),
  P(7186, 284, 234, 24),
  P(7694, 354, 258, 24),
  P(8240, 284, 282, 24),
  P(8710, 214, 210, 24),
  P(9218, 144, 234, 24),
  P(9764, 184, 258, 24),
  P(10234, 224, 282, 24),
  P(10742, 164, 210, 24),
  P(11288, 204, 234, 24),
  P(11758, 244, 258, 24),
  P(12266, 214, 282, 24),
  P(12812, 184, 210, 24),
  P(13282, 154, 234, 24),
  P(19420, 236, 300, 24),
  P(19830, 206, 330, 24)
],
  [
  R(880, 416, 104, 14, 3.6, 680),
  R(3920, 346, 112, 14, -4.1, 760),
  R(7240, 298, 120, 14, 4.4, 830),
  R(18800, 190, 126, 14, -4.7, 900)
],
  [
  T(1120, 356, 118, 16, 'oneWay', {}),
  T(1970, 286, 118, 16, 'phantom', {}),
  T(2700, 216, 118, 16, 'commitDrop', { reform: 2.65 }),
  T(3550, 146, 118, 16, 'reverseBooster', { dir: -1, boost: 970 }),
  T(4280, 76, 118, 16, 'magnet', { pull: 520 }),
  T(5130, 156, 118, 16, 'antiJump', {}),
  T(5860, 236, 118, 16, 'booster', { dir: -1, boost: 1020, lift: 36 }),
  T(6710, 316, 118, 16, 'fakeCheckpoint', {}),
  T(7440, 246, 118, 16, 'phantom', {}),
  T(8290, 176, 118, 16, 'antiSpeed', {}),
  T(9020, 106, 104, 16, 'safeSpike', {}),
  T(9870, 186, 118, 16, 'baitShift', { shiftX: -150, range: 220 }),
  T(10600, 266, 96, 16, 'falseSpike', {}),
  T(11450, 336, 118, 16, 'baitShift', { shiftX: -150, range: 220 }),
  T(12180, 266, 96, 16, 'falseSpike', {}),
  T(13030, 196, 104, 16, 'safeSpike', {})
],
  [
  C(280, 460),
  C(660, 398),
  C(1130, 328, 'dinar'),
  C(1638, 258),
  C(2184, 188, 'sela'),
  C(2654, 118),
  C(3162, 48, 'maneh'),
  C(3708, 128, 'dinar'),
  C(4178, 208),
  C(4686, 288, 'dinar'),
  C(5232, 218),
  C(5702, 148, 'sela'),
  C(6210, 78),
  C(6756, 158, 'maneh'),
  C(7226, 238, 'dinar'),
  C(7734, 308),
  C(8280, 238, 'dinar'),
  C(8750, 168),
  C(9258, 98, 'sela'),
  C(9804, 138),
  C(10274, 178, 'maneh'),
  C(10782, 118, 'dinar'),
  C(11328, 158),
  C(11798, 198, 'dinar'),
  C(12306, 168),
  C(12852, 138, 'sela'),
  C(13322, 108),
  C(19580, 186, 'sela'),
  C(19950, 158, 'maneh')
],
  [
  C(19720, 164, 'dinar'),
  C(20050, 166, 'sela')
],
  [
  S(450, 481, 100, 24, 1, 1, 2),
  S(3200, 481, 112, 24, 1.75, 1, 2.15),
  S(6400, 481, 124, 24, 2.25, 1, 2.25),
  S(9600, 481, 136, 24, 1.95, 1, 2.15),
  S(19040, 481, 148, 24, 2.5, 1, 2.25),
  { x: 18600, y: 481, w: 92, h: 24, proximity: true, range: 140, warning: 0.96, duration: 1.05 }
],
  [
  E(2100, 130, 1980, 2320, 132, 'watcher', 'Mirror Abattoir debt-eye', { dropCoin: 'dinar' }),
  E(4520, 300, 4400, 4740, 144, 'scroll', 'Mirror Abattoir false clerk'),
  E(6420, 108, 6280, 6660, 146, 'leaper', 'Mirror Abattoir coin-jailer', { dropCoin: 'sela' }),
  E(8540, 230, 8400, 8800, 154, 'herder', 'Mirror Abattoir return herder'),
  E(18480, 198, 18340, 18760, 146, 'baitGuard', 'Mirror Abattoir final deceiver'),
  E(19320, 170, 19200, 19580, 138, 'feign', 'Mirror Abattoir sleeping debt', { dropCoin: 'maneh' })
],
  [
  G(1080, 274, 190, 130, 'The first bridge runs when trusted; wait for its confession.', {}),
  G(2100, 70, 210, 145, 'A visible carrier holds a required coin above the broad shelf.', {}),
  G(5600, 74, 210, 145, 'The upper route is hard, optional, and fully readable.', {}),
  G(7080, 212, 200, 135, 'The falling teeth show a full warning breath before judgment.', { spikes: [{ x: 7240, y: 82, w: 80, h: 24, warning: 0.96, duration: 1.12, fallSpeed: 450 }, { x: 7345, y: 114, w: 84, h: 24, warning: 1.04, duration: 1.12, fallSpeed: 480 }, { x: 7455, y: 146, w: 88, h: 24, warning: 1.12, duration: 1.12, fallSpeed: 510 }] }),
  G(19260, 154, 210, 135, 'The final fake coin is loud enough to be refused.', {}),
  G(19640, 130, 240, 145, 'The door opens only after every honest coin, key, and carrier debt.', { openExit: true })
],
  [
  'Mirror Abattoir is hard because it teaches before it strikes.',
  'The Awtsmoos leaves fake coins, fake platforms, spike-bridges, and proximity teeth in readable space.',
  'Every required spark is reachable by a broad route or a warned upper detour.'
],
  {
    fakeCoins: [
      F(1180, 320, 'dinar', 'The first coin laughed with teeth.'),
      F(3580, 282, 'sela', 'The center shine was a hook.'),
      F(7440, 182, 'maneh', 'The warned crown was bait.'),
      F(19160, 152, 'dinar', 'The late bargain wore a knife.'),
      F(19460, 150, 'sela', 'The final discount snapped shut.')
],
    trickCoins: [
      { x: 1960, y: 120, kind: 'reverseRunner', speed: 340, min: 1780, max: 2280 },
      { x: 3440, y: 260, kind: 'trapBait', baitX: 3860, speed: 265, min: 3240, max: 4000 },
      { x: 5480, y: 116, kind: 'shyVanish', safeSide: 'right' },
      { x: 8460, y: 220, kind: 'fakeRunner', min: 8260, max: 8740 },
      { x: 19200, y: 184, kind: 'trapBait', baitX: 19520, speed: 275, min: 19040, max: 19630 }
]
  }
);
