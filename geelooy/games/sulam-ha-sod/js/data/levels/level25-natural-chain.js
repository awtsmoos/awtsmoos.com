// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Natural Chain River of Warned Teeth is rewritten by hand as a broad natural-chain chamber.
 *
 * Chapter 25: The Awtsmoos draws river, wind, stone, cave, root, sky, echo,
 * and breath into one living ladder. The main road is wide enough for a human
 * rhythm, the upper road is a readable invitation, and every false coin shines
 * with room around it so trickery becomes lesson instead of claustrophe.
 */
export const level25 = L(
  '25 · Natural Chain River of Warned Teeth',
  13200,
  { x: 60, y: 420 },
  P(12930, 112, 52, 90),
  'The river lies in daylight. Cross by reading water, not by trusting shine.',
  [
  P(0, 505, 390, 35),
  P(580, 448, 198, 22),
  P(1020, 384, 218, 22),
  P(1494, 320, 238, 22),
  P(2002, 256, 258, 22),
  P(2442, 192, 198, 22),
  P(2916, 128, 218, 22),
  P(3424, 208, 238, 22),
  P(3864, 288, 258, 22),
  P(4338, 368, 198, 22),
  P(4846, 304, 218, 22),
  P(5286, 240, 238, 22),
  P(5760, 176, 258, 22),
  P(6268, 256, 198, 22),
  P(6708, 336, 218, 22),
  P(7182, 272, 238, 22),
  P(7690, 208, 258, 22),
  P(8130, 144, 198, 22),
  P(8604, 224, 218, 22),
  P(9112, 304, 238, 22),
  P(9552, 240, 258, 22),
  P(10026, 168, 198, 22),
  P(10534, 188, 218, 22),
  P(12400, 232, 270, 22),
  P(12770, 204, 310, 22)
],
  [
  R(800, 418, 98, 14, 3.1, 600),
  R(3640, 354, 106, 14, -3.4, 680),
  R(6740, 304, 112, 14, 3.7, 740),
  R(11780, 188, 118, 14, -3.9, 800)
],
  [
  T(1080, 366, 114, 16, 'antiSpeed', {}),
  T(1890, 302, 94, 16, 'falseSpike', {}),
  T(2600, 238, 114, 16, 'ice', { duration: 1.35 }),
  T(3410, 174, 114, 16, 'booster', { dir: -1, boost: 940, lift: 30 }),
  T(4120, 110, 114, 16, 'oneWay', {}),
  T(4930, 190, 114, 16, 'phantom', {}),
  T(5640, 270, 114, 16, 'commitDrop', { reform: 2.45 }),
  T(6450, 350, 114, 16, 'reverseBooster', { dir: -1, boost: 900 }),
  T(7160, 286, 114, 16, 'magnet', { pull: 470 }),
  T(7970, 222, 114, 16, 'antiJump', {}),
  T(8680, 158, 114, 16, 'booster', { dir: 1, boost: 940, lift: 30 }),
  T(9490, 238, 114, 16, 'fakeCheckpoint', {}),
  T(10200, 318, 114, 16, 'phantom', {})
],
  [
  C(260, 460),
  C(620, 404),
  C(1060, 340, 'maneh'),
  C(1534, 276),
  C(2042, 212),
  C(2482, 148, 'dinar'),
  C(2956, 84),
  C(3464, 164, 'sela'),
  C(3904, 244),
  C(4378, 324, 'maneh'),
  C(4886, 260),
  C(5326, 196),
  C(5800, 132, 'dinar'),
  C(6308, 212),
  C(6748, 292, 'sela'),
  C(7222, 228),
  C(7730, 164, 'maneh'),
  C(8170, 100),
  C(8644, 180),
  C(9152, 260, 'dinar'),
  C(9592, 196),
  C(10066, 124, 'sela'),
  C(10574, 144),
  C(12530, 184, 'sela'),
  C(12890, 158, 'maneh')
],
  [
  C(12660, 162, 'dinar'),
  C(12980, 164, 'sela')
],
  [
  S(430, 481, 98, 24, 1, 1, 2),
  S(2980, 481, 110, 24, 1.7, 1, 2.1),
  S(5960, 481, 120, 24, 2.2, 1, 2.2),
  S(8940, 481, 130, 24, 1.9, 1, 2.1),
  S(12020, 481, 140, 24, 2.4, 1, 2.2)
],
  [
  E(1980, 158, 1880, 2180, 122, 'watcher', 'River Teeth Chain watcher', { dropCoin: 'dinar' }),
  E(4240, 334, 4140, 4460, 132, 'scroll', 'River Teeth Chain scroll'),
  E(5960, 142, 5860, 6180, 134, 'leaper', 'River Teeth Chain leaper', { dropCoin: 'sela' }),
  E(7920, 238, 7800, 8160, 144, 'herder', 'River Teeth Chain herder'),
  E(11500, 194, 11380, 11760, 136, 'baitGuard', 'River Teeth Chain final guard')
],
  [
  G(1020, 280, 180, 130, 'The low shine is readable bait; the broad shelf above is honest.', {}),
  G(1980, 82, 200, 140, 'A visible carrier holds one real coin. Stomp from the wide route.', {}),
  G(5580, 86, 200, 140, 'The upper route is optional, wide, and collectible.', {}),
  G(6820, 216, 190, 130, 'The falling teeth show a full warning breath.', { spikes: [{ x: 6960, y: 86, w: 78, h: 24, warning: 0.95, duration: 1.1, fallSpeed: 430 }, { x: 7060, y: 118, w: 82, h: 24, warning: 1.03, duration: 1.1, fallSpeed: 460 }, { x: 7165, y: 150, w: 86, h: 24, warning: 1.1, duration: 1.1, fallSpeed: 490 }] }),
  G(12280, 150, 200, 130, 'The final reversal is announced before it is required.', {}),
  G(12620, 128, 230, 140, 'The door opens only after every honest coin and key is gathered.', { openExit: true })
],
  [
  'River Teeth Chain turns natural scenery into readable choice.',
  'The Awtsmoos leaves no required spark in a cramped throat.',
  'Every hazard is visible, warned, or spaced away from mandatory treasure.'
],
  {
    fakeCoins: [
      F(1160, 326, 'dinar', 'The first natural glitter had teeth.'),
      F(3860, 316, 'sela', 'The centered reward was a blade in bark.'),
      F(7160, 186, 'maneh', 'The warned crown glittered falsely.'),
      F(12380, 148, 'sela', 'The final natural discount snapped shut.')
],
    trickCoins: [
      { x: 1860, y: 148, kind: 'reverseRunner', speed: 315, min: 1700, max: 2140 },
      { x: 3380, y: 276, kind: 'trapBait', baitX: 3660, speed: 240, min: 3220, max: 3780 },
      { x: 5380, y: 132, kind: 'shyVanish', safeSide: 'right' },
      { x: 8300, y: 228, kind: 'fakeRunner', min: 8120, max: 8560 },
      { x: 12180, y: 182, kind: 'trapBait', baitX: 12460, speed: 250, min: 12040, max: 12560 }
]
  }
);
