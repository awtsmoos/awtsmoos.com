//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the tiferes battlefield vast vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/**
 * B"H
 * Tiferes Battlefield Vast, engagement-tuned.
 *
 * Chapter 47: the arena remains wide, but the opening no longer scatters souls
 * into exile. Spawns now form immediate rival clusters while distant lanes still
 * let the match expand into a vast battlefield after first contact.
 */
export const tiferesBattlefieldVast = makeMap({
	id: 'tiferes-vast',
	name: 'Tiferes Battlefield Vast',
	theme: 'parchment',
	hue: 48,
	description: 'Huge balanced multi-lane battlefield with faster first contact.',
	bounds: bounds(-2600, 9200, -1900, 1850),
	spawns: points([820, 260], [1420, -80], [2040, 260], [2660, -140], [3280, 260], [3900, 40]),
	platforms: [
		...lane(-1700, 820, 12),
		...steps(-650, 520, 12),
		...steps(-180, 80, 10),
		platform(1250, 430, 760, 26, 'duel'),
		platform(2450, 120, 680, 26, 'heart'),
		platform(2250, -420, 760, 28, 'crown'),
		platform(5200, -260, 620, 26, 'altar'),
		platform(6750, 260, 520, 24, 'wing')
	],
	weaponSpawns: points(
		[1000, 500],
		[1700, 240],
		[2580, -460],
		[3300, 240],
		[5650, -300],
		[7300, 500]
	),
	powerupSpawns: points([1180, 300], [2050, -40], [3350, -560], [5000, 120], [6900, 360])
});
