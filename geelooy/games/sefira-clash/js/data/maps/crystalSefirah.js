//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the crystal sefirah vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Crystal Sefirah is a bright vertical shard-field of ledges. */
export const crystalSefirah = makeMap({
	id: 'crystal-sefirah',
	name: 'Crystal Sefirah',
	theme: 'blue',
	hue: 196,
	description: 'A huge crystalline vertical arena full of recovery routes.',
	bounds: bounds(-2800, 8600, -2300, 1750),
	spawns: points([-500, 220], [900, -260], [2500, 120], [4100, -620], [5900, 220]),
	platforms: [
		...lane(-1700, 880, 11),
		...steps(-700, 540, 13),
		...steps(-300, -40, 10),
		platform(2950, -1020, 640, 26, 'crystal')
	],
	weaponSpawns: points([100, 540], [1600, -80], [3200, -1060], [4800, -80], [6500, 540]),
	powerupSpawns: points([680, 350], [2050, -310], [3300, -1160], [4650, -310], [6050, 350])
});
