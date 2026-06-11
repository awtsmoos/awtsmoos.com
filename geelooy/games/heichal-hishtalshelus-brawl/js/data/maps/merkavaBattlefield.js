import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Merkava wheels turn the battlefield into a wide chariot of war. */
export const merkavaBattlefield = makeMap({
  id: 'merkava-battlefield', name: 'Merkava Battlefield', theme: 'ember', hue: 32,
  description: 'A huge chariot field with layered wheel platforms.', bounds: bounds(-3200, 9800, -1800, 1700),
  spawns: points([-800, 180], [900, -60], [2600, 240], [4700, -80], [6900, 220], [8400, 60]),
  platforms: [...lane(-2100, 820, 13), ...steps(-900, 520, 14), ...steps(-300, 40, 11), platform(3850, -420, 760, 26, 'wheel')],
  weaponSpawns: points([100, 500], [1700, 260], [3400, -460], [5200, 260], [7200, 500]),
  powerupSpawns: points([750, 310], [2400, 0], [4100, -560], [5900, 0], [7600, 310])
});
