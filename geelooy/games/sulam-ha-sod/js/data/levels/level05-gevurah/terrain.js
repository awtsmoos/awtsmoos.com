// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Gevurah terrain: verdicts that lie in public.
 *
 * Chapter 5: The Awtsmoos struck the courtroom floor until the stone confessed:
 * some platforms are bodies and some are only smoke wearing geometry. Real
 * ledges keep bright rims; phantom ledges drift over spike-law and teach the
 * eye to distrust easy gold without hiding the walkable route.
 *
 * @constant {Array<object>} gevurahPlatforms
 */
export const gevurahPlatforms = [
  P(0, 505, 620, 35), P(700, 455, 260, 22), P(1060, 405, 240, 22),
  P(1430, 355, 230, 22), P(1810, 305, 230, 22), P(2190, 355, 230, 22),
  P(2570, 405, 230, 22), P(2950, 355, 230, 22), P(3330, 305, 230, 22),
  P(3540, 300, 150, 22)
];

/** @constant {Array<object>} gevurahRotors */
export const gevurahRotors = [
  R(620, 480, 96, 14, 0.55, 110),
  R(2140, 330, 96, 14, -0.55, 110),
  R(3190, 330, 88, 14, 0.5, 105)
];

/** @constant {Array<object>} gevurahTricks */
export const gevurahTricks = [
  T(960, 430, 92, 16, 'phantom'), T(990, 439, 92, 16, 'oneWay'),
  T(1320, 388, 96, 16, 'ghostSpike'), T(1360, 389, 92, 16, 'oneWay'),
  T(1690, 330, 105, 16, 'phantom'), T(2500, 390, 105, 16, 'falseSpike'),
  T(2880, 389, 92, 16, 'oneWay'), T(3220, 330, 105, 16, 'phantom')
];
