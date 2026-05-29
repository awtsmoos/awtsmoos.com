// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Shattered Ledger of Wide Accounts is rewritten by hand as a fair late-game chamber.
 *
 * Chapter 21: The Awtsmoos breathes a broad road into the stone, then lets
 * sparks of money, keys, and deception hang above it like letters of creation.
 * Nothing required is buried in a cramped throat; the hazards show their teeth
 * before biting; the upper road is a crown for players who read instead of
 * rushing.
 */
export const level21 = L(
  '21 · Shattered Ledger of Wide Accounts',
  12400,
  { x: 60, y: 420 },
  P(12140, 110, 52, 90),
  'Every coin is reachable, but the ledger punishes sprinting through the fine print.',
  [
  P(0, 505, 380, 35),
  P(560, 450, 190, 22),
  P(980, 390, 208, 22),
  P(1430, 330, 226, 22),
  P(1910, 270, 244, 22),
  P(2330, 210, 190, 22),
  P(2780, 150, 208, 22),
  P(3260, 230, 226, 22),
  P(3680, 310, 244, 22),
  P(4130, 390, 190, 22),
  P(4610, 325, 208, 22),
  P(5030, 255, 226, 22),
  P(5480, 185, 244, 22),
  P(5960, 265, 190, 22),
  P(6380, 345, 208, 22),
  P(6830, 280, 226, 22),
  P(7310, 215, 244, 22),
  P(7730, 145, 190, 22),
  P(8180, 225, 208, 22),
  P(8660, 305, 226, 22),
  P(9080, 240, 244, 22),
  P(9530, 170, 190, 22),
  P(10010, 190, 208, 22),
  P(11640, 225, 260, 22),
  P(11980, 200, 300, 22)
],
  [
  R(760, 420, 96, 14, 2.8, 560),
  R(3440, 362, 104, 14, -3.2, 640),
  R(6380, 312, 110, 14, 3.4, 700),
  R(11020, 186, 116, 14, -3.6, 760)
],
  [
  T(1040, 372, 112, 16, 'fakeCheckpoint', {}),
  T(1860, 312, 112, 16, 'phantom', {}),
  T(2600, 252, 112, 16, 'antiSpeed', {}),
  T(3420, 192, 92, 16, 'falseSpike', {}),
  T(4160, 132, 112, 16, 'reverseBooster', { dir: 1, boost: 820 }),
  T(4980, 212, 112, 16, 'ice', { duration: 1.35 }),
  T(5720, 292, 112, 16, 'booster', { dir: 1, boost: 900, lift: 28 }),
  T(6540, 372, 112, 16, 'phantom', {}),
  T(7280, 307, 112, 16, 'commitDrop', { reform: 2.4 }),
  T(8100, 237, 112, 16, 'magnet', { pull: 440 }),
  T(8840, 167, 112, 16, 'antiJump', {}),
  T(9660, 247, 112, 16, 'booster', { dir: -1, boost: 900, lift: 28 })
],
  [
  C(260, 460),
  C(600, 406, 'sela'),
  C(1020, 346),
  C(1470, 286, 'maneh'),
  C(1950, 226),
  C(2370, 166, 'dinar'),
  C(2820, 106),
  C(3300, 186, 'sela'),
  C(3720, 266),
  C(4170, 346, 'maneh'),
  C(4650, 281),
  C(5070, 211, 'dinar'),
  C(5520, 141),
  C(6000, 221, 'sela'),
  C(6420, 301),
  C(6870, 236, 'maneh'),
  C(7350, 171),
  C(7770, 101, 'dinar'),
  C(8220, 181),
  C(8700, 261, 'sela'),
  C(9120, 196),
  C(9570, 126, 'maneh'),
  C(10050, 146),
  C(11760, 180, 'sela'),
  C(12100, 155, 'maneh')
],
  [
  C(11880, 158, 'dinar'),
  C(12190, 160, 'sela')
],
  [
  S(410, 481, 96, 24, 1, 1, 2),
  S(2780, 481, 108, 24, 1.6, 1, 2.1),
  S(5660, 481, 118, 24, 2.1, 1, 2.2),
  S(8420, 481, 126, 24, 1.8, 1, 2.1),
  S(11300, 481, 138, 24, 2.3, 1, 2.2)
],
  [
  E(1880, 176, 1780, 2080, 118, 'watcher', 'Shattered Ledger Exchange patience watcher', { dropCoin: 'dinar' }),
  E(4040, 356, 3940, 4240, 128, 'feign', 'Shattered Ledger Exchange sleeping account'),
  E(5740, 151, 5640, 5940, 130, 'scroll', 'Shattered Ledger Exchange scroll keeper', { dropCoin: 'sela' }),
  E(7580, 246, 7480, 7820, 140, 'leaper', 'Shattered Ledger Exchange readable leaper'),
  E(10740, 191, 10640, 10980, 132, 'baitGuard', 'Shattered Ledger Exchange final guard')
],
  [
  G(980, 286, 170, 130, 'The glitter is low, but the safe route is broad and above it.', {}),
  G(1900, 96, 190, 130, 'A visible enemy carries a real coin. Stomp from the wide shelf.', {}),
  G(5480, 94, 190, 130, 'The upper route is optional, readable, and fully collectible.', {}),
  G(6560, 220, 180, 130, 'The warned teeth fall after a full breath, not instantly.', { spikes: [{ x: 6700, y: 88, w: 76, h: 24, warning: 0.95, duration: 1.1, fallSpeed: 420 }, { x: 6795, y: 118, w: 80, h: 24, warning: 1.02, duration: 1.1, fallSpeed: 450 }, { x: 6895, y: 148, w: 84, h: 24, warning: 1.08, duration: 1.1, fallSpeed: 480 }] }),
  G(11520, 145, 190, 130, 'The last reversal is shown before it is demanded.', {}),
  G(11840, 124, 220, 140, 'The door opens only after every honest coin and key is gathered.', { openExit: true })
],
  [
  'Shattered Ledger Exchange widens the path but sharpens the choice.',
  'The Awtsmoos hides no required item in a cramped slot.',
  'Every fake shine is warned by spacing, shape, or silence.'
],
  {
    fakeCoins: [
      F(1120, 330, 'dinar', 'The first low bargain was teeth.'),
      F(3620, 320, 'sela', 'The centered prize was a blade in a robe.'),
      F(6940, 190, 'maneh', 'The warned crown glittered falsely.'),
      F(11620, 145, 'sela', 'The final discount snapped shut.')
],
    trickCoins: [
      { x: 1760, y: 172, kind: 'reverseRunner', speed: 300, min: 1620, max: 2040 },
      { x: 3180, y: 286, kind: 'trapBait', baitX: 3440, speed: 230, min: 3040, max: 3540 },
      { x: 5320, y: 142, kind: 'shyVanish', safeSide: 'right' },
      { x: 8060, y: 236, kind: 'fakeRunner', min: 7900, max: 8320 },
      { x: 11420, y: 178, kind: 'trapBait', baitX: 11680, speed: 240, min: 11280, max: 11780 }
]
  }
);
