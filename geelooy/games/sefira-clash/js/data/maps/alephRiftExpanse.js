import { bounds, makeMap, platform, points, steps } from './factory.js';

/** B"H — Aleph opens the central void and asks every fighter to recover. */
export const alephRiftExpanse = makeMap({
  id: 'aleph-rift', name: 'Aleph Rift Expanse', theme: 'parchment', hue: 55,
  description: 'Giant central void where recovery becomes a sacred duel.', bounds: bounds(-2500, 8200, -1400, 1550),
  spawns: points([-450, 220], [950, 40], [2450, 220], [4300, 40], [6100, 220]),
  platforms: [platform(-1300, 760, 1250, 42), platform(900, 760, 1250, 42), platform(3400, 760, 1250, 42), platform(5600, 760, 1200, 42), ...steps(-150, 500, 11)],
  weaponSpawns: points([220, 460], [1520, 360], [2920, 330], [4550, 360], [6200, 460]),
  powerupSpawns: points([650, 280], [2100, 320], [3650, 320], [5300, 280])
});
