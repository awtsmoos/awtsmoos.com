//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the chesed river bridges vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Chesed gives forgiving bridges where recovery battles blossom. */
export const chesedRiverBridges = makeMap({
	id: 'chesed-rivers',
	name: 'Chesed River Bridges',
	theme: 'blue',
	hue: 188,
	description: 'Large soft bridges with forgiving recoveries and air fights.',
	bounds: bounds(-2300, 7800, -1100, 1450),
	spawns: points([-200, 240], [1100, 160], [2500, 240], [4100, 160], [5700, 240]),
	platforms: [
		...lane(-1300, 740, 10),
		...steps(-520, 470, 11),
		platform(2500, 270, 700, 24, 'river')
	],
	weaponSpawns: points([260, 430], [1450, 330], [2850, 230], [4400, 330], [6000, 430]),
	powerupSpawns: points([820, 330], [2220, 170], [3760, 330], [5300, 170])
});
