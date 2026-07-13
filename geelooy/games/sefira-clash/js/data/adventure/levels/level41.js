//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level41 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Pei Mouth Gate speaks through alternating narrow and open combat chambers. */
export const level41 = adventureMap({
	no: 41,
	name: 'Pei Mouth Gate',
	theme: 'voice',
	hue: 18,
	difficulty: 'Expert',
	description: 'Move between a narrow throat and a broad mouth where attacks change value.',
	idea: 'Tight and open spaces alternate, demanding different move choices.',
	objective: { type: 'collect-and-defeat', perutas: 7 },
	exit: 'Collect seven voice Perutas and silence both mouth guards.',
	progression: ['space adaptation', 'move choice', 'door pressure'],
	enemies: ['Throat Guard', 'Mouth Guard'],
	rows: [
		'P.###.P.....P..###..P.......',
		'S..B...###..C..###...K....E',
		'====..=====....=====..======',
		'..P....O....P....*....W..P.'
	]
});
