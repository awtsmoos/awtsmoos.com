//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level38 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Nun Fall begins at the summit and turns falling into an authored route. */
export const level38 = adventureMap({
	no: 38,
	name: 'Nun Fall',
	theme: 'fall',
	hue: 258,
	difficulty: 'Expert',
	description: 'Descend through staggered platforms while collecting light in freefall.',
	idea: 'Controlled fast-fall and air drift replace conventional upward climbing.',
	objective: { type: 'reach', perutas: 6 },
	exit: 'Collect six falling Perutas and land at the valley gate.',
	progression: ['controlled descent', 'fast fall', 'air drift'],
	enemies: ['Falling Nun'],
	rows: [
		'S.P..###...................',
		'.......P..###..B............',
		'............P..C..###.......',
		'......O..P......P....###....',
		'...........*..W..P.......E',
		'==========================='
	]
});
