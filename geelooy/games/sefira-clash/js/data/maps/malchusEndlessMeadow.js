import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Malchus stretches the kingdom into a long readable brawl road. */
export const malchusEndlessMeadow = makeMap({
  id: 'malchus-meadow', name: 'Malchus Endless Meadow', theme: 'ember', hue: 22,
  description: 'Long grounded kingdom with fast horizontal brawls.', bounds: bounds(-2200, 7600, -1050, 1350),
  spawns: points([-350, 260], [900, 260], [2250, 180], [3800, 260], [5450, 180]),
  platforms: [...lane(-1200, 740, 10), ...steps(-420, 500, 10), platform(3180, 330, 620, 24, 'royal')],
  weaponSpawns: points([80, 460], [1340, 460], [2660, 280], [4050, 460], [5650, 280]),
  powerupSpawns: points([650, 380], [1980, 210], [3420, 380], [5020, 210])
});
