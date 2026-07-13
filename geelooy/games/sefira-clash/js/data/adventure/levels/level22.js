//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level22 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** River Split divides traversal into fast upper and safe lower currents. */
export const level22 = adventureMap({
	no: 22,
	name: 'River Split',
	theme: 'river',
	hue: 196,
	difficulty: 'Hard',
	description: 'Choose the swift upper current or the guarded lower bridge.',
	idea: 'Two parallel routes trade speed for combat risk and treasure density.',
	objective: { type: 'collect-and-defeat', perutas: 6 },
	exit: 'Collect six river Perutas and defeat the bridge keeper.',
	progression: ['route choice', 'drop-through', 'rejoin timing'],
	enemies: ['River Keeper'],
	rows: [
		'..P..###..P....###..P.......',
		'S.......B....C.........P...E',
		'=====..=====..=====..=======',
		'...P.....O....*.....P..W....',
		'============================'
	]
});
