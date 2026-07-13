//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the seven heichalos vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Seven Heichalos makes a long pilgrimage of linked chambers. */
export const sevenHeichalos = makeMap({
	id: 'seven-heichalos',
	name: 'Seven Heichalos',
	theme: 'blue',
	hue: 224,
	description: 'Seven huge combat chambers connected by aerial routes.',
	bounds: bounds(-3600, 11200, -1700, 1650),
	spawns: points([-900, 250], [1000, 100], [2900, 250], [4800, 100], [6700, 250], [8600, 100]),
	platforms: [
		...lane(-2500, 820, 15),
		...steps(-1300, 520, 15),
		platform(800, 120, 520, 26),
		platform(2900, -120, 520, 26),
		platform(5000, 120, 520, 26),
		platform(7100, -120, 520, 26)
	],
	weaponSpawns: points([0, 500], [1900, 300], [3800, 20], [5700, 300], [7600, 500]),
	powerupSpawns: points([650, 320], [2550, -20], [4450, 320], [6350, -20], [8250, 320])
});
