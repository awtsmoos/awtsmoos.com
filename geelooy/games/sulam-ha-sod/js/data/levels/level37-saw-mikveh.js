// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Saw Mikveh of the Upside-Down Step is rewritten by hand as a harsher but fair late-game court.
 *
 * Chapter 37: The Awtsmoos tears certainty open like iron cloth. Fake coins
 * glitter with room to refuse them, fake platforms move with visible intent,
 * safe-spike bridges teach reversal, proximity teeth warn before judgment, and
 * every carrier enemy holds a counted spark. The chamber is sharper now, but
 * the route stays readable.
 */
export const level37 = L(
  '37 · Saw Mikveh of the Upside-Down Step',
  21560,
  { x: 60, y: 420 },
  P(21280, 112, 52, 90),
  'Purification begins when the safe-looking route becomes unclean.',
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
  P(20700, 236, 300, 24),
  P(21110, 206, 330, 24)
],
  [
  R(880, 416, 104, 14, 3.6, 680),
  R(3920, 346, 112, 14, -4.1, 760),
  R(7240, 298, 120, 14, 4.4, 830),
  R(20080, 190, 126, 14, -4.7, 900)
],
  [
  T(1120, 356, 118, 16, 'commitDrop', { reform: 2.65 }),
  T(1970, 286, 118, 16, 'reverseBooster', { dir: -1, boost: 970 }),
  T(2700, 216, 118, 16, 'magnet', { pull: 520 }),
  T(3550, 146, 118, 16, 'antiJump', {}),
  T(4280, 76, 118, 16, 'booster', { dir: -1, boost: 1020, lift: 36 }),
  T(5130, 156, 118, 16, 'fakeCheckpoint', {}),
  T(5860, 236, 118, 16, 'phantom', {}),
  T(6710, 316, 118, 16, 'antiSpeed', {}),
  T(7440, 246, 104, 16, 'safeSpike', {}),
  T(8290, 176, 118, 16, 'baitShift', { shiftX: -150, range: 220 }),
  T(9020, 106, 96, 16, 'falseSpike', {}),
  T(9870, 186, 118, 16, 'baitShift', { shiftX: -150, range: 220 }),
  T(10600, 266, 96, 16, 'falseSpike', {}),
  T(11450, 336, 104, 16, 'safeSpike', {}),
  T(12180, 266, 118, 16, 'oneWay', {}),
  T(13030, 196, 118, 16, 'phantom', {})
],
  [
  C(280, 460),
  C(660, 398),
  C(1130, 328, 'sela'),
  C(1638, 258),
  C(2184, 188, 'maneh'),
  C(2654, 118, 'dinar'),
  C(3162, 48),
  C(3708, 128, 'dinar'),
  C(4178, 208),
  C(4686, 288, 'sela'),
  C(5232, 218),
  C(5702, 148, 'maneh'),
  C(6210, 78, 'dinar'),
  C(6756, 158),
  C(7226, 238, 'dinar'),
  C(7734, 308),
  C(8280, 238, 'sela'),
  C(8750, 168),
  C(9258, 98, 'maneh'),
  C(9804, 138, 'dinar'),
  C(10274, 178),
  C(10782, 118, 'dinar'),
  C(11328, 158),
  C(11798, 198, 'sela'),
  C(12306, 168),
  C(12852, 138, 'maneh'),
  C(13322, 108, 'dinar'),
  C(20860, 186, 'sela'),
  C(21230, 158, 'maneh')
],
  [
  C(21000, 164, 'dinar'),
  C(21330, 166, 'sela')
],
  [
  S(450, 481, 100, 24, 1, 1, 2),
  S(3200, 481, 112, 24, 1.75, 1, 2.15),
  S(6400, 481, 124, 24, 2.25, 1, 2.25),
  S(9600, 481, 136, 24, 1.95, 1, 2.15),
  S(20320, 481, 148, 24, 2.5, 1, 2.25),
  { x: 19880, y: 481, w: 92, h: 24, proximity: true, range: 140, warning: 0.96, duration: 1.05 }
],
  [
  E(2100, 130, 1980, 2320, 132, 'watcher', 'Saw Mikveh debt-eye', { dropCoin: 'dinar' }),
  E(4520, 300, 4400, 4740, 144, 'scroll', 'Saw Mikveh false clerk'),
  E(6420, 108, 6280, 6660, 146, 'leaper', 'Saw Mikveh coin-jailer', { dropCoin: 'sela' }),
  E(8540, 230, 8400, 8800, 154, 'herder', 'Saw Mikveh return herder'),
  E(19760, 198, 19620, 20040, 146, 'baitGuard', 'Saw Mikveh final deceiver'),
  E(20600, 170, 20480, 20860, 138, 'feign', 'Saw Mikveh sleeping debt', { dropCoin: 'maneh' })
],
  [
  G(1080, 274, 190, 130, 'The first bridge runs when trusted; wait for its confession.', {}),
  G(2100, 70, 210, 145, 'A visible carrier holds a required coin above the broad shelf.', {}),
  G(5600, 74, 210, 145, 'The upper route is hard, optional, and fully readable.', {}),
  G(7080, 212, 200, 135, 'The falling teeth show a full warning breath before judgment.', { spikes: [{ x: 7240, y: 82, w: 80, h: 24, warning: 0.96, duration: 1.12, fallSpeed: 450 }, { x: 7345, y: 114, w: 84, h: 24, warning: 1.04, duration: 1.12, fallSpeed: 480 }, { x: 7455, y: 146, w: 88, h: 24, warning: 1.12, duration: 1.12, fallSpeed: 510 }] }),
  G(20540, 154, 210, 135, 'The final fake coin is loud enough to be refused.', {}),
  G(20920, 130, 240, 145, 'The door opens only after every honest coin, key, and carrier debt.', { openExit: true })
],
  [
  'Saw Mikveh is hard because it teaches before it strikes.',
  'The Awtsmoos leaves fake coins, fake platforms, spike-bridges, and proximity teeth in readable space.',
  'Every required spark is reachable by a broad route or a warned upper detour.'
],
  {
    fakeCoins: [
      F(1180, 320, 'dinar', 'The first coin laughed with teeth.'),
      F(3580, 282, 'sela', 'The center shine was a hook.'),
      F(7440, 182, 'maneh', 'The warned crown was bait.'),
      F(20440, 152, 'dinar', 'The late bargain wore a knife.'),
      F(20740, 150, 'sela', 'The final discount snapped shut.')
],
    trickCoins: [
      { x: 1960, y: 120, kind: 'reverseRunner', speed: 340, min: 1780, max: 2280 },
      { x: 3440, y: 260, kind: 'trapBait', baitX: 3860, speed: 265, min: 3240, max: 4000 },
      { x: 5480, y: 116, kind: 'shyVanish', safeSide: 'right' },
      { x: 8460, y: 220, kind: 'fakeRunner', min: 8260, max: 8740 },
      { x: 20480, y: 184, kind: 'trapBait', baitX: 20800, speed: 275, min: 20320, max: 20910 }
]
  }
);
