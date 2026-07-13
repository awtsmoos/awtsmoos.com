//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level33 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Tes Serpent coils a long route around alternating upper and lower ambushes. */
export const level33 = adventureMap({
	no: 33,
	name: 'Tes Serpent',
	theme: 'serpent',
	hue: 122,
	difficulty: 'Hard+',
	description: 'Follow a coiling road whose treasure reverses direction three times.',
	idea: 'Switchbacks create pursuit, retreat, and turnaround combat decisions.',
	objective: { type: 'collect-and-defeat', perutas: 7 },
	exit: 'Gather seven serpent Perutas and defeat the coiled guardian.',
	progression: ['turnaround', 'pursuit', 'lane reversal'],
	enemies: ['Serpent Guardian'],
	rows: [
		'P..###..P........P..###..P..',
		'......B..###..C..###........',
		'S.P..................P.....E',
		'======..========..==========',
		'...P....O....*....W....P....'
	]
});
