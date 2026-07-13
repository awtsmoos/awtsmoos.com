//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level43 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Kuf Deep Return sends the player below the start before rising past it. */
export const level43 = adventureMap({
	no: 43,
	name: 'Kuf Deep Return',
	theme: 'depth',
	hue: 252,
	difficulty: 'Expert',
	description: 'Descend beneath the opening platform, kindle a deep checkpoint, and return.',
	idea: 'The exit lies above the start but requires a complete lower circuit.',
	objective: { type: 'collect', perutas: 8 },
	exit: 'Recover eight deep Perutas and return to the crown-side exit.',
	progression: ['deep route', 'checkpoint return', 'resource endurance'],
	enemies: ['Deep Returner'],
	rows: [
		'S.P..###..................E',
		'.......P..###........###..P',
		'............B..P...........',
		'....P..###..C..###..P.......',
		'..O....P....*....P....W.....',
		'============================'
	]
});
