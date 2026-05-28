// B"H
import { P, R, T } from '../../levelPrimitives.js';

/**
 * Netzach terrain scroll.
 *
 * The Awtsmoos stretches persistence into rungs: plain stone, rotating breath,
 * ice, phantom mercy, and one bright shove that becomes a test of stopping.
 */
export const netzachPlatforms = [
  P(0, 505, 420, 35), P(560, 455, 140, 20), P(820, 405, 140, 20),
  P(1080, 360, 150, 20), P(1360, 420, 180, 20), P(1660, 360, 150, 20),
  P(1940, 305, 150, 20), P(2220, 380, 160, 20), P(2520, 320, 160, 20),
  P(2860, 420, 220, 20), P(3160, 440, 150, 20)
];

export const netzachRotors = [R(720, 430, 70, 14, 1.4, 260), R(1840, 335, 80, 14, -1.7, 330)];

export const netzachTricks = [
  T(980, 390, 85, 16, 'ice', { duration: 0.95 }),
  T(1240, 345, 70, 16, 'phantom'),
  T(1500, 405, 82, 16, 'booster', { dir: 1, boost: 620, lift: 40 }),
  T(2100, 350, 78, 16, 'falseSpike'),
  T(2700, 300, 90, 16, 'ice', { duration: 1.05 }),
  T(1160, 340, 70, 16, 'falseSpike'),
  T(2400, 360, 75, 16, 'phantom'),
  T(3000, 404, 90, 16, 'commitDrop', { reform: 2.4 })
];
