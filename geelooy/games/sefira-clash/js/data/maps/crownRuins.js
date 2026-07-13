//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the crown ruins vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Crown Ruins is a broken giant castle for chaotic casual brawls. */
export const crownRuins = makeMap({
	id: 'crown-ruins',
	name: 'Crown Ruins',
	theme: 'parchment',
	hue: 300,
	description: 'A massive broken crown-castle with many comeback routes.',
	bounds: bounds(-3400, 10800, -2100, 1850),
	spawns: points([-900, 260], [800, -120], [2600, 260], [4500, -520], [6500, 260], [8400, -120]),
	platforms: [
		...lane(-2400, 880, 14),
		...steps(-1100, 560, 15),
		...steps(-500, -140, 11),
		platform(3550, -980, 840, 30, 'crown')
	],
	weaponSpawns: points([0, 540], [1800, 0], [3970, -1020], [5750, 0], [7800, 540]),
	powerupSpawns: points([700, 360], [2500, -290], [3970, -1140], [5450, -290], [7400, 360])
});
