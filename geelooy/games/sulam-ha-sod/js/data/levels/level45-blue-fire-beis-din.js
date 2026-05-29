// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Blue Fire Beis Din is rewritten by hand as a complete final-block chamber.
 *
 * Chapter 45: The Awtsmoos opens a manual gate with no shared builder hiding
 * behind it. Fake coins glitter with refusal room, moving false platforms reveal
 * their motion before commitment, safe-spike bridges teach reversal, proximity
 * teeth warn before judgment, and enemy carriers hold counted sparks. The level
 * is cruel, readable, broad, and fully explicit in this file.
 */
export const level45 = L(
  '45 · Blue Fire Beis Din',
  28400,
  { x: 60, y: 420 },
  P(28110, 112, 52, 90),
  'Blue fire judges speed. The bridge that looks lethal may be your only witness.',
  [
  P(0, 505, 410, 35),
  P(650, 444, 218, 24),
  P(1135, 374, 242, 24),
  P(1662, 304, 266, 24),
  P(2231, 234, 290, 24),
  P(2716, 164, 218, 24),
  P(3243, 94, 242, 24),
  P(3812, 174, 266, 24),
  P(4297, 254, 290, 24),
  P(4824, 334, 218, 24),
  P(5393, 264, 242, 24),
  P(5878, 194, 266, 24),
  P(6405, 124, 290, 24),
  P(6974, 204, 218, 24),
  P(7459, 284, 242, 24),
  P(7986, 354, 266, 24),
  P(8555, 284, 290, 24),
  P(9040, 214, 218, 24),
  P(9567, 144, 242, 24),
  P(10136, 184, 266, 24),
  P(10621, 224, 290, 24),
  P(11148, 164, 218, 24),
  P(11717, 204, 242, 24),
  P(12202, 244, 266, 24),
  P(12729, 214, 290, 24),
  P(13298, 184, 218, 24),
  P(13783, 154, 242, 24),
  P(14310, 194, 266, 24),
  P(14879, 234, 290, 24),
  P(27500, 238, 320, 24),
  P(27930, 208, 350, 24)
],
  [
  R(920, 416, 108, 14, 3.9, 720),
  R(4160, 346, 116, 14, -4.5, 800),
  R(7680, 298, 124, 14, 4.8, 880),
  R(26860, 190, 132, 14, -5.1, 960)
],
  [
  T(1160, 356, 120, 16, 'booster', { dir: -1, boost: 1080, lift: 40 }),
  T(2029, 286, 120, 16, 'fakeCheckpoint', {}),
  T(2770, 216, 120, 16, 'phantom', {}),
  T(3639, 146, 120, 16, 'antiSpeed', {}),
  T(4380, 76, 106, 16, 'safeSpike', {}),
  T(5249, 156, 120, 16, 'baitShift', { shiftX: -170, range: 245 }),
  T(5990, 236, 98, 16, 'falseSpike', {}),
  T(6859, 316, 120, 16, 'ice', { duration: 1.8 }),
  T(7600, 246, 120, 16, 'oneWay', {}),
  T(8469, 176, 120, 16, 'baitShift', { shiftX: -170, range: 245 }),
  T(9210, 106, 98, 16, 'falseSpike', {}),
  T(10079, 186, 106, 16, 'safeSpike', {}),
  T(10820, 266, 120, 16, 'oneWay', {}),
  T(11689, 336, 120, 16, 'phantom', {}),
  T(12430, 266, 120, 16, 'commitDrop', { reform: 2.85 }),
  T(13299, 196, 120, 16, 'reverseBooster', { dir: -1, boost: 1030 }),
  T(14040, 126, 120, 16, 'magnet', { pull: 560 }),
  T(14909, 166, 120, 16, 'antiJump', {})
],
  [
  C(300, 460),
  C(700, 398, 'sela'),
  C(1185, 328),
  C(1712, 258, 'maneh'),
  C(2281, 188, 'dinar'),
  C(2766, 118),
  C(3293, 48, 'dinar'),
  C(3862, 128),
  C(4347, 208, 'sela'),
  C(4874, 288),
  C(5443, 218, 'maneh'),
  C(5928, 148, 'dinar'),
  C(6455, 78),
  C(7024, 158, 'dinar'),
  C(7509, 238),
  C(8036, 308, 'sela'),
  C(8605, 238),
  C(9090, 168, 'maneh'),
  C(9617, 98, 'dinar'),
  C(10186, 138),
  C(10671, 178, 'dinar'),
  C(11198, 118),
  C(11767, 158, 'sela'),
  C(12252, 198),
  C(12779, 168, 'maneh'),
  C(13348, 138, 'dinar'),
  C(13833, 108),
  C(14360, 148, 'dinar'),
  C(14929, 188),
  C(27670, 188, 'sela'),
  C(28050, 158, 'maneh')
],
  [
  C(27810, 166, 'dinar'),
  C(28150, 168, 'sela')
],
  [
  S(470, 481, 104, 24, 1, 1, 2),
  S(3440, 481, 116, 24, 1.8, 1, 2.15),
  S(6880, 481, 128, 24, 2.3, 1, 2.25),
  S(10320, 481, 140, 24, 2, 1, 2.15),
  S(27100, 481, 152, 24, 2.55, 1, 2.25),
  { x: 26660, y: 481, w: 96, h: 24, proximity: true, range: 146, warning: 0.98, duration: 1.08 }
],
  [
  E(2200, 130, 2060, 2440, 136, 'watcher', 'Blue Fire debt-eye', { dropCoin: 'dinar' }),
  E(4720, 300, 4580, 4960, 148, 'scroll', 'Blue Fire false clerk'),
  E(6740, 108, 6580, 6980, 150, 'leaper', 'Blue Fire coin-jailer', { dropCoin: 'sela' }),
  E(9020, 230, 8860, 9300, 158, 'herder', 'Blue Fire return herder'),
  E(26520, 198, 26360, 26820, 150, 'baitGuard', 'Blue Fire final deceiver'),
  E(27400, 170, 27270, 27680, 142, 'feign', 'Blue Fire sleeping debt', { dropCoin: 'maneh' })
],
  [
  G(1120, 274, 200, 130, 'Blue Fire: the first bridge runs when trusted; wait for its confession.', {}),
  G(2200, 70, 220, 145, 'A visible carrier holds a required coin above the broad shelf.', {}),
  G(5880, 74, 220, 145, 'The upper route is dangerous, optional, wide, and collectible.', {}),
  G(7520, 212, 210, 135, 'The falling teeth show a full warning breath before judgment.', { spikes: [{ x: 7680, y: 82, w: 82, h: 24, warning: 0.98, duration: 1.12, fallSpeed: 470 }, { x: 7790, y: 114, w: 86, h: 24, warning: 1.06, duration: 1.12, fallSpeed: 500 }, { x: 7905, y: 146, w: 90, h: 24, warning: 1.14, duration: 1.12, fallSpeed: 530 }] }),
  G(27340, 154, 220, 135, 'The final fake coin is loud enough to be refused.', {}),
  G(27730, 130, 250, 145, 'The door opens only after every honest coin, key, and carrier debt.', { openExit: true })
],
  [
  'Blue Fire is fully hand-authored here, no final-seven factory veil.',
  'The Awtsmoos leaves fake coins, fake platforms, spike-bridges, and proximity teeth in readable space.',
  'Every required spark is reachable by a broad route or a warned upper detour.'
],
  {
    fakeCoins: [
      F(1220, 320, 'dinar', 'Blue Fire first coin laughed with teeth.'),
      F(3820, 282, 'sela', 'The center shine was a hook.'),
      F(7880, 182, 'maneh', 'The warned crown was bait.'),
      F(27240, 152, 'dinar', 'The late bargain wore a knife.'),
      F(27550, 150, 'sela', 'The final discount snapped shut.')
],
    trickCoins: [
      { x: 2060, y: 120, kind: 'reverseRunner', speed: 360, min: 1860, max: 2400 },
      { x: 3660, y: 260, kind: 'trapBait', baitX: 4120, speed: 285, min: 3440, max: 4260 },
      { x: 5760, y: 116, kind: 'shyVanish', safeSide: 'right' },
      { x: 8940, y: 220, kind: 'fakeRunner', min: 8720, max: 9220 },
      { x: 27280, y: 184, kind: 'trapBait', baitX: 27620, speed: 295, min: 27100, max: 27730 }
]
  }
);
