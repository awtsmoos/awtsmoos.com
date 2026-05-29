// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Abyss Ledger of Borrowed Teeth is rewritten by hand as a harsher but fair late-game court.
 *
 * Chapter 39: The Awtsmoos tears certainty open like iron cloth. Fake coins
 * glitter with room to refuse them, fake platforms move with visible intent,
 * safe-spike bridges teach reversal, proximity teeth warn before judgment, and
 * every carrier enemy holds a counted spark. The chamber is sharper now, but
 * the route stays readable.
 */
export const level39 = L(
  '39 · Abyss Ledger of Borrowed Teeth',
  22840,
  { x: 60, y: 420 },
  P(22560, 112, 52, 90),
  'The ledger balances only after every enemy debt is paid.',
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
  P(21980, 236, 300, 24),
  P(22390, 206, 330, 24)
],
  [
  R(880, 416, 104, 14, 3.6, 680),
  R(3920, 346, 112, 14, -4.1, 760),
  R(7240, 298, 120, 14, 4.4, 830),
  R(21360, 190, 126, 14, -4.7, 900)
],
  [
  T(1120, 356, 118, 16, 'magnet', { pull: 520 }),
  T(1970, 286, 118, 16, 'antiJump', {}),
  T(2700, 216, 118, 16, 'booster', { dir: -1, boost: 1020, lift: 36 }),
  T(3550, 146, 118, 16, 'fakeCheckpoint', {}),
  T(4280, 76, 118, 16, 'phantom', {}),
  T(5130, 156, 118, 16, 'antiSpeed', {}),
  T(5860, 236, 104, 16, 'safeSpike', {}),
  T(6710, 316, 118, 16, 'baitShift', { shiftX: -150, range: 220 }),
  T(7440, 246, 96, 16, 'falseSpike', {}),
  T(8290, 176, 118, 16, 'baitShift', { shiftX: -150, range: 220 }),
  T(9020, 106, 96, 16, 'falseSpike', {}),
  T(9870, 186, 104, 16, 'safeSpike', {}),
  T(10600, 266, 118, 16, 'oneWay', {}),
  T(11450, 336, 118, 16, 'phantom', {}),
  T(12180, 266, 118, 16, 'commitDrop', { reform: 2.65 }),
  T(13030, 196, 118, 16, 'reverseBooster', { dir: -1, boost: 970 })
],
  [
  C(280, 460),
  C(660, 398),
  C(1130, 328, 'maneh'),
  C(1638, 258, 'dinar'),
  C(2184, 188),
  C(2654, 118, 'dinar'),
  C(3162, 48),
  C(3708, 128, 'sela'),
  C(4178, 208),
  C(4686, 288, 'maneh'),
  C(5232, 218, 'dinar'),
  C(5702, 148),
  C(6210, 78, 'dinar'),
  C(6756, 158),
  C(7226, 238, 'sela'),
  C(7734, 308),
  C(8280, 238, 'maneh'),
  C(8750, 168, 'dinar'),
  C(9258, 98),
  C(9804, 138, 'dinar'),
  C(10274, 178),
  C(10782, 118, 'sela'),
  C(11328, 158),
  C(11798, 198, 'maneh'),
  C(12306, 168, 'dinar'),
  C(12852, 138),
  C(13322, 108, 'dinar'),
  C(22140, 186, 'sela'),
  C(22510, 158, 'maneh')
],
  [
  C(22280, 164, 'dinar'),
  C(22610, 166, 'sela')
],
  [
  S(450, 481, 100, 24, 1, 1, 2),
  S(3200, 481, 112, 24, 1.75, 1, 2.15),
  S(6400, 481, 124, 24, 2.25, 1, 2.25),
  S(9600, 481, 136, 24, 1.95, 1, 2.15),
  S(21600, 481, 148, 24, 2.5, 1, 2.25),
  { x: 21160, y: 481, w: 92, h: 24, proximity: true, range: 140, warning: 0.96, duration: 1.05 }
],
  [
  E(2100, 130, 1980, 2320, 132, 'watcher', 'Abyss Ledger debt-eye', { dropCoin: 'dinar' }),
  E(4520, 300, 4400, 4740, 144, 'scroll', 'Abyss Ledger false clerk'),
  E(6420, 108, 6280, 6660, 146, 'leaper', 'Abyss Ledger coin-jailer', { dropCoin: 'sela' }),
  E(8540, 230, 8400, 8800, 154, 'herder', 'Abyss Ledger return herder'),
  E(21040, 198, 20900, 21320, 146, 'baitGuard', 'Abyss Ledger final deceiver'),
  E(21880, 170, 21760, 22140, 138, 'feign', 'Abyss Ledger sleeping debt', { dropCoin: 'maneh' })
],
  [
  G(1080, 274, 190, 130, 'The first bridge runs when trusted; wait for its confession.', {}),
  G(2100, 70, 210, 145, 'A visible carrier holds a required coin above the broad shelf.', {}),
  G(5600, 74, 210, 145, 'The upper route is hard, optional, and fully readable.', {}),
  G(7080, 212, 200, 135, 'The falling teeth show a full warning breath before judgment.', { spikes: [{ x: 7240, y: 82, w: 80, h: 24, warning: 0.96, duration: 1.12, fallSpeed: 450 }, { x: 7345, y: 114, w: 84, h: 24, warning: 1.04, duration: 1.12, fallSpeed: 480 }, { x: 7455, y: 146, w: 88, h: 24, warning: 1.12, duration: 1.12, fallSpeed: 510 }] }),
  G(21820, 154, 210, 135, 'The final fake coin is loud enough to be refused.', {}),
  G(22200, 130, 240, 145, 'The door opens only after every honest coin, key, and carrier debt.', { openExit: true })
],
  [
  'Abyss Ledger is hard because it teaches before it strikes.',
  'The Awtsmoos leaves fake coins, fake platforms, spike-bridges, and proximity teeth in readable space.',
  'Every required spark is reachable by a broad route or a warned upper detour.'
],
  {
    fakeCoins: [
      F(1180, 320, 'dinar', 'The first coin laughed with teeth.'),
      F(3580, 282, 'sela', 'The center shine was a hook.'),
      F(7440, 182, 'maneh', 'The warned crown was bait.'),
      F(21720, 152, 'dinar', 'The late bargain wore a knife.'),
      F(22020, 150, 'sela', 'The final discount snapped shut.')
],
    trickCoins: [
      { x: 1960, y: 120, kind: 'reverseRunner', speed: 340, min: 1780, max: 2280 },
      { x: 3440, y: 260, kind: 'trapBait', baitX: 3860, speed: 265, min: 3240, max: 4000 },
      { x: 5480, y: 116, kind: 'shyVanish', safeSide: 'right' },
      { x: 8460, y: 220, kind: 'fakeRunner', min: 8260, max: 8740 },
      { x: 21760, y: 184, kind: 'trapBait', baitX: 22080, speed: 275, min: 21600, max: 22190 }
]
  }
);
