//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the gevurah forge expanse vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Gevurah forges brutal pressure lanes and punish windows. */
export const gevurahForgeExpanse = makeMap({
	id: 'gevurah-forge',
	name: 'Gevurah Forge Expanse',
	theme: 'ember',
	hue: 8,
	description: 'Wide danger lanes with high-pressure side platforms.',
	bounds: bounds(-2100, 7200, -1200, 1400),
	spawns: points([-120, 240], [1120, 150], [2500, 240], [3950, 150], [5400, 240]),
	platforms: [
		...lane(-1100, 760, 9),
		...steps(-300, 500, 10),
		platform(1700, 255, 360, 22),
		platform(4500, 255, 360, 22)
	],
	weaponSpawns: points([240, 460], [1580, 220], [2850, 460], [4380, 220], [5780, 460]),
	powerupSpawns: points([700, 390], [2100, 200], [3500, 390], [5100, 200])
});
