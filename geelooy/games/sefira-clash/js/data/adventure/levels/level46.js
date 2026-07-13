//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level46 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Tav Seal Bridge locks four treasure chambers behind one final guardian. */
export const level46 = adventureMap({
	no: 46,
	name: 'Tav Seal Bridge',
	theme: 'seal',
	hue: 220,
	difficulty: 'Expert',
	description: 'Open four sealed bridge pockets before facing the final keeper.',
	idea: 'Compact treasure rooms reconverge into a long final combat span.',
	objective: { type: 'collect-and-defeat', perutas: 8 },
	exit: 'Collect eight seal Perutas and defeat the Tav keeper.',
	progression: ['room clearing', 'return route', 'final bridge duel'],
	enemies: ['Tav Keeper'],
	rows: [
		'P.###.P.###....P.###.P.###',
		'S....B....P..C..P....K...E',
		'====..====..====..====..===',
		'..O....P....*....P....W....',
		'============================'
	]
});
