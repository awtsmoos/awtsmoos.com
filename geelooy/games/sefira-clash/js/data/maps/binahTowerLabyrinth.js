//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the binah tower labyrinth vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Binah rises into towers where recovery, traps, and jumps matter. */
export const binahTowerLabyrinth = makeMap({
	id: 'binah-towers',
	name: 'Binah Tower Labyrinth',
	theme: 'blue',
	hue: 208,
	description: 'Very tall recovery map with large side towers.',
	bounds: bounds(-1900, 6700, -1700, 1450),
	spawns: points([-100, 40], [820, -180], [2030, 100], [3550, -240], [5000, 80]),
	platforms: [
		...lane(-900, 780, 8),
		...steps(-450, 520, 10),
		...steps(-220, 120, 9),
		platform(2760, -280, 500, 24, 'wisdom')
	],
	weaponSpawns: points([240, 480], [1340, 80], [2500, -330], [3900, 80], [5250, 480]),
	powerupSpawns: points([640, 210], [1760, -60], [3020, -420], [4480, -60])
});
