// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Hidden Manna Treasury Above the Teeth is rewritten by hand as a fair late-game chamber.
 *
 * Chapter 19: The Awtsmoos breathes a broad road into the stone, then lets
 * sparks of money, keys, and deception hang above it like letters of creation.
 * Nothing required is buried in a cramped throat; the hazards show their teeth
 * before biting; the upper road is a crown for players who read instead of
 * rushing.
 */
export const level19 = L(
  '19 · Hidden Manna Treasury Above the Teeth',
  11600,
  { x: 60, y: 420 },
  P(11340, 110, 52, 90),
  'The manna is visible once you climb; the swallowed coins require mercy and a stomp.',
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
  P(10840, 225, 260, 22),
  P(11180, 200, 300, 22)
],
  [
  R(760, 420, 96, 14, 2.8, 560),
  R(3440, 362, 104, 14, -3.2, 640),
  R(6380, 312, 110, 14, 3.4, 700),
  R(10220, 186, 116, 14, -3.6, 760)
],
  [
  T(1040, 372, 112, 16, 'antiJump', {}),
  T(1860, 312, 112, 16, 'booster', { dir: -1, boost: 900, lift: 28 }),
  T(2600, 252, 112, 16, 'fakeCheckpoint', {}),
  T(3420, 192, 112, 16, 'phantom', {}),
  T(4160, 132, 112, 16, 'antiSpeed', {}),
  T(4980, 212, 92, 16, 'falseSpike', {}),
  T(5720, 292, 112, 16, 'reverseBooster', { dir: 1, boost: 820 }),
  T(6540, 372, 112, 16, 'ice', { duration: 1.35 }),
  T(7280, 307, 112, 16, 'booster', { dir: 1, boost: 900, lift: 28 }),
  T(8100, 237, 112, 16, 'phantom', {}),
  T(8840, 167, 112, 16, 'commitDrop', { reform: 2.4 }),
  T(9660, 247, 112, 16, 'magnet', { pull: 440 })
],
  [
  C(260, 460),
  C(600, 406, 'dinar'),
  C(1020, 346),
  C(1470, 286, 'sela'),
  C(1950, 226),
  C(2370, 166, 'maneh'),
  C(2820, 106),
  C(3300, 186, 'dinar'),
  C(3720, 266),
  C(4170, 346, 'sela'),
  C(4650, 281),
  C(5070, 211, 'maneh'),
  C(5520, 141),
  C(6000, 221, 'dinar'),
  C(6420, 301),
  C(6870, 236, 'sela'),
  C(7350, 171),
  C(7770, 101, 'maneh'),
  C(8220, 181),
  C(8700, 261, 'dinar'),
  C(9120, 196),
  C(9570, 126, 'sela'),
  C(10050, 146),
  C(10960, 180, 'sela'),
  C(11300, 155, 'maneh')
],
  [
  C(11080, 158, 'dinar'),
  C(11390, 160, 'sela')
],
  [
  S(410, 481, 96, 24, 1, 1, 2),
  S(2780, 481, 108, 24, 1.6, 1, 2.1),
  S(5660, 481, 118, 24, 2.1, 1, 2.2),
  S(8420, 481, 126, 24, 1.8, 1, 2.1),
  S(10500, 481, 138, 24, 2.3, 1, 2.2)
],
  [
  E(1880, 176, 1780, 2080, 118, 'watcher', 'Hidden Manna Treasury patience watcher', { dropCoin: 'dinar' }),
  E(4040, 356, 3940, 4240, 128, 'feign', 'Hidden Manna Treasury sleeping account'),
  E(5740, 151, 5640, 5940, 130, 'scroll', 'Hidden Manna Treasury scroll keeper', { dropCoin: 'sela' }),
  E(7580, 246, 7480, 7820, 140, 'leaper', 'Hidden Manna Treasury readable leaper'),
  E(9940, 191, 9840, 10180, 132, 'baitGuard', 'Hidden Manna Treasury final guard')
],
  [
  G(980, 286, 170, 130, 'The glitter is low, but the safe route is broad and above it.', {}),
  G(1900, 96, 190, 130, 'A visible enemy carries a real coin. Stomp from the wide shelf.', {}),
  G(5480, 94, 190, 130, 'The upper route is optional, readable, and fully collectible.', {}),
  G(6560, 220, 180, 130, 'The warned teeth fall after a full breath, not instantly.', { spikes: [{ x: 6700, y: 88, w: 76, h: 24, warning: 0.95, duration: 1.1, fallSpeed: 420 }, { x: 6795, y: 118, w: 80, h: 24, warning: 1.02, duration: 1.1, fallSpeed: 450 }, { x: 6895, y: 148, w: 84, h: 24, warning: 1.08, duration: 1.1, fallSpeed: 480 }] }),
  G(10720, 145, 190, 130, 'The last reversal is shown before it is demanded.', {}),
  G(11040, 124, 220, 140, 'The door opens only after every honest coin and key is gathered.', { openExit: true })
],
  [
  'Hidden Manna Treasury widens the path but sharpens the choice.',
  'The Awtsmoos hides no required item in a cramped slot.',
  'Every fake shine is warned by spacing, shape, or silence.'
],
  {
    fakeCoins: [
      F(1120, 330, 'dinar', 'The first low bargain was teeth.'),
      F(3620, 320, 'sela', 'The centered prize was a blade in a robe.'),
      F(6940, 190, 'maneh', 'The warned crown glittered falsely.'),
      F(10820, 145, 'sela', 'The final discount snapped shut.')
],
    trickCoins: [
      { x: 1760, y: 172, kind: 'reverseRunner', speed: 300, min: 1620, max: 2040 },
      { x: 3180, y: 286, kind: 'trapBait', baitX: 3440, speed: 230, min: 3040, max: 3540 },
      { x: 5320, y: 142, kind: 'shyVanish', safeSide: 'right' },
      { x: 8060, y: 236, kind: 'fakeRunner', min: 7900, max: 8320 },
      { x: 10620, y: 178, kind: 'trapBait', baitX: 10880, speed: 240, min: 10480, max: 10980 }
]
  }
);
