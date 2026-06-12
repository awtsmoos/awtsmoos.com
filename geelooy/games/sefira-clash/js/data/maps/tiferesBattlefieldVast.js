import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/**
 * B"H
 * Tiferes Battlefield Vast, repaired for mobile readability.
 *
 * Chapter 103: the first arena must sell the game. It now stretches wider and
 * taller, with more routes, bigger gaps, higher platforms, and enough space for
 * zoomed-out brawls instead of one cramped parchment hallway.
 */
export const tiferesBattlefieldVast = makeMap({
  id: 'tiferes-vast', name: 'Tiferes Battlefield Vast', theme: 'parchment', hue: 48,
  description: 'Huge balanced multi-lane battlefield for serious mobile brawls.', bounds: bounds(-2600, 9200, -1900, 1850),
  spawns: points([-400, 260], [980, -120], [2500, 260], [4300, -220], [6100, 260], [7600, 40]),
  platforms: [
    ...lane(-1700, 820, 12),
    ...steps(-650, 520, 12),
    ...steps(-180, 80, 10),
    platform(2250, -420, 760, 28, 'crown'),
    platform(5200, -260, 620, 26, 'altar'),
    platform(6750, 260, 520, 24, 'wing')
  ],
  weaponSpawns: points([160, 500], [1450, 240], [2580, -460], [3980, 240], [5650, -300], [7300, 500]),
  powerupSpawns: points([740, 300], [2050, -40], [3350, -560], [5000, 120], [6900, 360])
});
