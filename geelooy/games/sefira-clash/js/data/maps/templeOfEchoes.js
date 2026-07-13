//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the temple of echoes vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Temple of Echoes creates mirrored routes and repeated duels. */
export const templeOfEchoes = makeMap({
	id: 'temple-echoes',
	name: 'Temple Of Echoes',
	theme: 'parchment',
	hue: 44,
	description: 'A mirrored mega-temple with upper and lower combat roads.',
	bounds: bounds(-3000, 9800, -1900, 1700),
	spawns: points([-700, 240], [1000, -120], [2800, 240], [4600, -120], [6400, 240]),
	platforms: [
		...lane(-2000, 840, 13),
		...steps(-900, 520, 13),
		...steps(-400, -120, 10),
		platform(2900, -720, 760, 26, 'echo')
	],
	weaponSpawns: points([150, 500], [1700, 0], [3250, -760], [4800, 0], [6500, 500]),
	powerupSpawns: points([700, 340], [2250, -230], [3250, -860], [4250, -230], [5850, 340])
});
