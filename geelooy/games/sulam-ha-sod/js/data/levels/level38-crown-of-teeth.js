// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Crown of Teeth Above the Locked Beginning is rewritten by hand as a harsher but fair late-game court.
 *
 * Chapter 38: The Awtsmoos tears certainty open like iron cloth. Fake coins
 * glitter with room to refuse them, fake platforms move with visible intent,
 * safe-spike bridges teach reversal, proximity teeth warn before judgment, and
 * every carrier enemy holds a counted spark. The chamber is sharper now, but
 * the route stays readable.
 */
export const level38 = L(
  '38 · Crown of Teeth Above the Locked Beginning',
  22200,
  { x: 60, y: 420 },
  P(21920, 112, 52, 90),
  'The crown is made of teeth, and some teeth are stairs.',
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
  P(21340, 236, 300, 24),
  P(21750, 206, 330, 24)
],
  [
  R(880, 416, 104, 14, 3.6, 680),
  R(3920, 346, 112, 14, -4.1, 760),
  R(7240, 298, 120, 14, 4.4, 830),
  R(20720, 190, 126, 14, -4.7, 900)
],
  [
  T(1120, 356, 118, 16, 'reverseBooster', { dir: 1, boost: 930 }),
  T(1970, 286, 118, 16, 'magnet', { pull: 520 }),
  T(2700, 216, 118, 16, 'antiJump', {}),
  T(3550, 146, 118, 16, 'booster', { dir: 1, boost: 1020, lift: 36 }),
  T(4280, 76, 118, 16, 'fakeCheckpoint', {}),
  T(5130, 156, 118, 16, 'phantom', {}),
  T(5860, 236, 118, 16, 'antiSpeed', {}),
  T(6710, 316, 104, 16, 'safeSpike', {}),
  T(7440, 246, 118, 16, 'baitShift', { shiftX: 135, range: 210 }),
  T(8290, 176, 96, 16, 'falseSpike', {}),
  T(9020, 106, 118, 16, 'baitShift', { shiftX: 135, range: 210 }),
  T(9870, 186, 96, 16, 'falseSpike', {}),
  T(10600, 266, 104, 16, 'safeSpike', {}),
  T(11450, 336, 118, 16, 'oneWay', {}),
  T(12180, 266, 118, 16, 'phantom', {}),
  T(13030, 196, 118, 16, 'commitDrop', { reform: 2.65 })
],
  [
  C(280, 460),
  C(660, 398, 'sela'),
  C(1130, 328),
  C(1638, 258, 'maneh'),
  C(2184, 188, 'dinar'),
  C(2654, 118),
  C(3162, 48, 'dinar'),
  C(3708, 128),
  C(4178, 208, 'sela'),
  C(4686, 288),
  C(5232, 218, 'maneh'),
  C(5702, 148, 'dinar'),
  C(6210, 78),
  C(6756, 158, 'dinar'),
  C(7226, 238),
  C(7734, 308, 'sela'),
  C(8280, 238),
  C(8750, 168, 'maneh'),
  C(9258, 98, 'dinar'),
  C(9804, 138),
  C(10274, 178, 'dinar'),
  C(10782, 118),
  C(11328, 158, 'sela'),
  C(11798, 198),
  C(12306, 168, 'maneh'),
  C(12852, 138, 'dinar'),
  C(13322, 108),
  C(21500, 186, 'sela'),
  C(21870, 158, 'maneh')
],
  [
  C(21640, 164, 'dinar'),
  C(21970, 166, 'sela')
],
  [
  S(450, 481, 100, 24, 1, 1, 2),
  S(3200, 481, 112, 24, 1.75, 1, 2.15),
  S(6400, 481, 124, 24, 2.25, 1, 2.25),
  S(9600, 481, 136, 24, 1.95, 1, 2.15),
  S(20960, 481, 148, 24, 2.5, 1, 2.25),
  { x: 20520, y: 481, w: 92, h: 24, proximity: true, range: 140, warning: 0.96, duration: 1.05 }
],
  [
  E(2100, 130, 1980, 2320, 132, 'watcher', 'Crown Teeth debt-eye', { dropCoin: 'dinar' }),
  E(4520, 300, 4400, 4740, 144, 'scroll', 'Crown Teeth false clerk'),
  E(6420, 108, 6280, 6660, 146, 'leaper', 'Crown Teeth coin-jailer', { dropCoin: 'sela' }),
  E(8540, 230, 8400, 8800, 154, 'herder', 'Crown Teeth return herder'),
  E(20400, 198, 20260, 20680, 146, 'baitGuard', 'Crown Teeth final deceiver'),
  E(21240, 170, 21120, 21500, 138, 'feign', 'Crown Teeth sleeping debt', { dropCoin: 'maneh' })
],
  [
  G(1080, 274, 190, 130, 'The first bridge runs when trusted; wait for its confession.', {}),
  G(2100, 70, 210, 145, 'A visible carrier holds a required coin above the broad shelf.', {}),
  G(5600, 74, 210, 145, 'The upper route is hard, optional, and fully readable.', {}),
  G(7080, 212, 200, 135, 'The falling teeth show a full warning breath before judgment.', { spikes: [{ x: 7240, y: 82, w: 80, h: 24, warning: 0.96, duration: 1.12, fallSpeed: 450 }, { x: 7345, y: 114, w: 84, h: 24, warning: 1.04, duration: 1.12, fallSpeed: 480 }, { x: 7455, y: 146, w: 88, h: 24, warning: 1.12, duration: 1.12, fallSpeed: 510 }] }),
  G(21180, 154, 210, 135, 'The final fake coin is loud enough to be refused.', {}),
  G(21560, 130, 240, 145, 'The door opens only after every honest coin, key, and carrier debt.', { openExit: true })
],
  [
  'Crown Teeth is hard because it teaches before it strikes.',
  'The Awtsmoos leaves fake coins, fake platforms, spike-bridges, and proximity teeth in readable space.',
  'Every required spark is reachable by a broad route or a warned upper detour.'
],
  {
    fakeCoins: [
      F(1180, 320, 'dinar', 'The first coin laughed with teeth.'),
      F(3580, 282, 'sela', 'The center shine was a hook.'),
      F(7440, 182, 'maneh', 'The warned crown was bait.'),
      F(21080, 152, 'dinar', 'The late bargain wore a knife.'),
      F(21380, 150, 'sela', 'The final discount snapped shut.')
],
    trickCoins: [
      { x: 1960, y: 120, kind: 'reverseRunner', speed: 340, min: 1780, max: 2280 },
      { x: 3440, y: 260, kind: 'trapBait', baitX: 3860, speed: 265, min: 3240, max: 4000 },
      { x: 5480, y: 116, kind: 'shyVanish', safeSide: 'right' },
      { x: 8460, y: 220, kind: 'fakeRunner', min: 8260, max: 8740 },
      { x: 21120, y: 184, kind: 'trapBait', baitX: 21440, speed: 275, min: 20960, max: 21550 }
]
  }
);
