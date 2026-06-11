import { bounds, makeMap, platform, points, steps } from './factory.js';

/** B"H — Kesser splits the crown so every edge decision becomes fate. */
export const kesserCrownRift = makeMap({
  id: 'kesser-rift', name: 'Kesser Crown Rift', theme: 'blue', hue: 285,
  description: 'A massive split crown with terrifying central recovery routes.', bounds: bounds(-2400, 7600, -1500, 1500),
  spawns: points([-350, 180], [900, -20], [2400, 180], [4100, -20], [5600, 180]),
  platforms: [platform(-1150, 760, 950, 42), platform(350, 760, 960, 42), platform(2000, 760, 960, 42), platform(3650, 760, 960, 42), platform(5300, 760, 900, 42), ...steps(-250, 500, 10), ...steps(250, 120, 8)],
  weaponSpawns: points([150, 455], [1290, 75], [2600, 455], [4260, 75], [5600, 455]),
  powerupSpawns: points([760, 300], [1860, 0], [3320, 300], [4900, 0])
});
