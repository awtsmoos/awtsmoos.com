//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the tree of life arena vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — The Tree of Life stacks worlds vertically for recovery and control. */
export const treeOfLifeArena = makeMap({
	id: 'tree-of-life',
	name: 'Tree Of Life Arena',
	theme: 'parchment',
	hue: 72,
	description: 'A towering multi-layer tree map with ten sefirah platforms.',
	bounds: bounds(-2600, 7600, -2600, 1800),
	spawns: points([-300, 220], [900, -420], [2200, 220], [3600, -820], [5200, 220]),
	platforms: [
		...lane(-1400, 900, 10),
		...steps(-600, 560, 12),
		...steps(-200, 80, 11),
		...steps(100, -520, 8),
		platform(2850, -1320, 720, 26, 'crown')
	],
	weaponSpawns: points([220, 560], [1600, 30], [3000, -1370], [4350, 30], [5900, 560]),
	powerupSpawns: points([780, 370], [2100, -250], [3220, -1460], [4540, -250], [5700, 370])
});
