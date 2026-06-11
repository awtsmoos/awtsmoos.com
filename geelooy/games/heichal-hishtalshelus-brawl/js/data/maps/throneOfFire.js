import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Throne of Fire forces brutal center control and side recoveries. */
export const throneOfFire = makeMap({
  id: 'throne-fire', name: 'Throne Of Fire', theme: 'ember', hue: 4,
  description: 'A huge central throne surrounded by dangerous lower roads.', bounds: bounds(-3000, 9200, -1600, 1750),
  spawns: points([-600, 260], [900, 80], [2500, -260], [4200, 80], [6100, 260]),
  platforms: [...lane(-1900, 860, 12), ...steps(-700, 540, 12), platform(2500, 120, 980, 36, 'throne'), platform(2820, -300, 340, 26, 'crown')],
  weaponSpawns: points([200, 520], [1800, 330], [3000, -340], [4600, 330], [6400, 520]),
  powerupSpawns: points([850, 360], [2200, 120], [3000, -440], [3800, 120], [5600, 360])
});
