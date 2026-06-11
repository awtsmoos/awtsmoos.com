import { bounds, makeMap, platform, points, steps } from './factory.js';

/** B"H — Abyss of Din makes the center a judgment pit and the sides salvation. */
export const abyssOfDin = makeMap({
  id: 'abyss-din', name: 'Abyss Of Din', theme: 'ember', hue: 350,
  description: 'A massive split-stage with a deep middle abyss.', bounds: bounds(-3400, 9800, -1600, 2100),
  spawns: points([-900, 280], [600, 20], [2500, 280], [4700, 20], [6800, 280]),
  platforms: [platform(-2200, 880, 1600, 44), platform(200, 880, 1600, 44), platform(3200, 880, 1600, 44), platform(6200, 880, 1500, 44), ...steps(-1000, 560, 12), ...steps(2800, 240, 9)],
  weaponSpawns: points([-150, 540], [1250, 340], [3100, 220], [5100, 340], [7100, 540]),
  powerupSpawns: points([450, 350], [1850, 160], [3600, 40], [5550, 160], [7000, 350])
});
