import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — River of Light rewards movement, recovery, and long chase routes. */
export const riverOfLight = makeMap({
  id: 'river-light', name: 'River Of Light', theme: 'blue', hue: 184,
  description: 'A flowing horizontal super-stage with safe recovery bridges.', bounds: bounds(-3600, 11800, -1300, 1700),
  spawns: points([-1000, 260], [900, 160], [2900, 260], [5000, 160], [7100, 260], [9100, 160]),
  platforms: [...lane(-2600, 840, 16), ...steps(-1200, 560, 16), platform(2300, 280, 900, 24, 'river'), platform(6100, 280, 900, 24, 'river')],
  weaponSpawns: points([0, 500], [1900, 360], [3900, 240], [5900, 360], [7900, 500]),
  powerupSpawns: points([760, 350], [2700, 190], [4700, 120], [6650, 190], [8600, 350])
});
