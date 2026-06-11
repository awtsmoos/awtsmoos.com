import { bounds, lane, makeMap, points, steps } from './factory.js';

/** B"H — Hod mirrors decisions so baiting and spacing become visible truth. */
export const hodMirrorPalace = makeMap({
  id: 'hod-mirrors', name: 'Hod Mirror Palace', theme: 'blue', hue: 245,
  description: 'Symmetrical mega-palace for readable competitive movement.', bounds: bounds(-2200, 7400, -1300, 1400),
  spawns: points([-250, 180], [1050, 60], [2500, 180], [3950, 60], [5250, 180]),
  platforms: [...lane(-1200, 750, 9), ...steps(-300, 490, 10), ...steps(140, 160, 9)],
  weaponSpawns: points([240, 450], [1500, 120], [2820, 450], [4140, 120], [5450, 450]),
  powerupSpawns: points([820, 280], [2140, 20], [3460, 280], [4780, 20])
});
