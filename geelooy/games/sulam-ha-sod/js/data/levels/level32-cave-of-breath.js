// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Cave of Breath Beneath the Crown is rewritten by hand as a broad natural-chain chamber.
 *
 * Chapter 32: The Awtsmoos draws river, wind, stone, cave, root, sky, echo,
 * and breath into one living ladder. The main road is wide enough for a human
 * rhythm, the upper road is a readable invitation, and every false coin shines
 * with room around it so trickery becomes lesson instead of claustrophe.
 */
export const level32 = L(
  '32 · Cave of Breath Beneath the Crown',
  16140,
  { x: 60, y: 420 },
  P(15870, 112, 52, 90),
  'The cave breathes upward. Wait between inhales, then climb.',
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
  P(15340, 232, 270, 22),
  P(15710, 204, 310, 22)
],
  [
  R(800, 418, 98, 14, 3.1, 600),
  R(3640, 354, 106, 14, -3.4, 680),
  R(6740, 304, 112, 14, 3.7, 740),
  R(14720, 188, 118, 14, -3.9, 800)
],
  [
  T(1080, 366, 114, 16, 'reverseBooster', { dir: 1, boost: 860 }),
  T(1890, 302, 114, 16, 'magnet', { pull: 470 }),
  T(2600, 238, 114, 16, 'antiJump', {}),
  T(3410, 174, 114, 16, 'booster', { dir: -1, boost: 940, lift: 30 }),
  T(4120, 110, 114, 16, 'fakeCheckpoint', {}),
  T(4930, 190, 114, 16, 'phantom', {}),
  T(5640, 270, 114, 16, 'antiSpeed', {}),
  T(6450, 350, 94, 16, 'falseSpike', {}),
  T(7160, 286, 114, 16, 'ice', { duration: 1.35 }),
  T(7970, 222, 114, 16, 'booster', { dir: -1, boost: 940, lift: 30 }),
  T(8680, 158, 114, 16, 'oneWay', {}),
  T(9490, 238, 114, 16, 'phantom', {}),
  T(10200, 318, 114, 16, 'commitDrop', { reform: 2.45 })
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
  C(15470, 184, 'sela'),
  C(15830, 158, 'maneh')
],
  [
  C(15600, 162, 'dinar'),
  C(15920, 164, 'sela')
],
  [
  S(430, 481, 98, 24, 1, 1, 2),
  S(2980, 481, 110, 24, 1.7, 1, 2.1),
  S(5960, 481, 120, 24, 2.2, 1, 2.2),
  S(8940, 481, 130, 24, 1.9, 1, 2.1),
  S(14960, 481, 140, 24, 2.4, 1, 2.2)
],
  [
  E(1980, 158, 1880, 2180, 122, 'watcher', 'Cave Breath Chain watcher', { dropCoin: 'dinar' }),
  E(4240, 334, 4140, 4460, 132, 'scroll', 'Cave Breath Chain scroll'),
  E(5960, 142, 5860, 6180, 134, 'leaper', 'Cave Breath Chain leaper', { dropCoin: 'sela' }),
  E(7920, 238, 7800, 8160, 144, 'herder', 'Cave Breath Chain herder'),
  E(14440, 194, 14320, 14700, 136, 'baitGuard', 'Cave Breath Chain final guard')
],
  [
  G(1020, 280, 180, 130, 'The low shine is readable bait; the broad shelf above is honest.', {}),
  G(1980, 82, 200, 140, 'A visible carrier holds one real coin. Stomp from the wide route.', {}),
  G(5580, 86, 200, 140, 'The upper route is optional, wide, and collectible.', {}),
  G(6820, 216, 190, 130, 'The falling teeth show a full warning breath.', { spikes: [{ x: 6960, y: 86, w: 78, h: 24, warning: 0.95, duration: 1.1, fallSpeed: 430 }, { x: 7060, y: 118, w: 82, h: 24, warning: 1.03, duration: 1.1, fallSpeed: 460 }, { x: 7165, y: 150, w: 86, h: 24, warning: 1.1, duration: 1.1, fallSpeed: 490 }] }),
  G(15220, 150, 200, 130, 'The final reversal is announced before it is required.', {}),
  G(15560, 128, 230, 140, 'The door opens only after every honest coin and key is gathered.', { openExit: true })
],
  [
  'Cave Breath Chain turns natural scenery into readable choice.',
  'The Awtsmoos leaves no required spark in a cramped throat.',
  'Every hazard is visible, warned, or spaced away from mandatory treasure.'
],
  {
    fakeCoins: [
      F(1160, 326, 'dinar', 'The first natural glitter had teeth.'),
      F(3860, 316, 'sela', 'The centered reward was a blade in bark.'),
      F(7160, 186, 'maneh', 'The warned crown glittered falsely.'),
      F(15320, 148, 'sela', 'The final natural discount snapped shut.')
],
    trickCoins: [
      { x: 1860, y: 148, kind: 'reverseRunner', speed: 315, min: 1700, max: 2140 },
      { x: 3380, y: 276, kind: 'trapBait', baitX: 3660, speed: 240, min: 3220, max: 3780 },
      { x: 5380, y: 132, kind: 'shyVanish', safeSide: 'right' },
      { x: 8300, y: 228, kind: 'fakeRunner', min: 8120, max: 8560 },
      { x: 15120, y: 182, kind: 'trapBait', baitX: 15400, speed: 250, min: 14980, max: 15500 }
]
  }
);
