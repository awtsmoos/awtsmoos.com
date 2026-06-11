import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Tiferes balances beauty and violence across a huge tournament field. */
export const tiferesBattlefieldVast = makeMap({
  id: 'tiferes-vast', name: 'Tiferes Battlefield Vast', theme: 'parchment', hue: 48,
  description: 'Huge balanced tri-lane battlefield for serious matches.', bounds: bounds(-1800, 6200),
  spawns: points([0, 260], [980, 160], [2250, 250], [3720, 140], [5050, 250]),
  platforms: [...lane(-900, 720, 8), ...steps(-200, 470, 9), platform(2050, 240, 520, 24, 'crown')],
  weaponSpawns: points([360, 430], [1450, 350], [2580, 200], [3650, 350], [4920, 430]),
  powerupSpawns: points([740, 290], [2050, 150], [3350, 290], [4700, 500])
});
