//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the merkava pinball court vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, hole, makeMap, platform, points, sideWalls, solidFloor, wall } from './factory.js';

/**
 * B"H
 * Merkava Pinball Court, engagement-tuned again.
 *
 * Chapter 64: the bounce chamber stops scattering the opening duel. Fighters
 * begin closer to the rally spine, then ricochet outward after first violence.
 */
export const merkavaPinballCourt = makeMap({
	id: 'merkava-pinball-court',
	name: 'Merkava Pinball Court',
	theme: 'cosmic',
	hue: 210,
	description: 'Bouncy side walls, angled chambers, narrow gaps, and immediate mid-map clashes.',
	bounds: bounds(-1300, 5600, -1900, 1900),
	rules: { walled: true, wallBounce: true },
	holes: [hole(2520, 460)],
	walls: [
		...sideWalls(-1050, 5350, -1720, 1180, 95),
		wall(1300, 240, 90, 560, 'pillar'),
		wall(3820, 240, 90, 560, 'pillar')
	],
	spawns: points([1780, 820], [2060, 170], [2320, 820], [3060, 820], [3340, 170], [3620, 820]),
	platforms: [
		...solidFloor(-1050, 910, 6400, 72, [hole(2520, 460)]),
		platform(620, 230, 520, 28, 'ramp'),
		platform(1740, 470, 760, 32, 'mid-left'),
		platform(2840, 470, 760, 32, 'mid-right'),
		platform(2260, 120, 860, 28, 'rally'),
		platform(3920, 230, 520, 28, 'ramp')
	],
	weaponSpawns: points([1860, 780], [2180, 130], [2520, 420], [3180, 130], [3520, 780]),
	powerupSpawns: points([2050, 760], [2450, 120], [3050, 760], [3400, 120])
});
