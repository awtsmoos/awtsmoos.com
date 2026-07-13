//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level16 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Moon Engine circles treasure around a machine-like central combat chamber. */
export const level16 = adventureMap({
	no: 16,
	name: 'Moon Engine',
	theme: 'moon',
	hue: 226,
	difficulty: 'Medium',
	description: 'Orbit a lunar engine, collect its charge, and silence its keeper.',
	idea: 'A circular route alternates upper pressure and lower recovery lanes.',
	objective: { type: 'collect-and-defeat', perutas: 6 },
	exit: 'Collect six lunar Perutas and defeat the engine keeper.',
	progression: ['orbit route', 'platform pressure', 'recovery mixup'],
	enemies: ['Moon Keeper'],
	rows: [
		'.....P..###.....###..P.......',
		'..###........B........###....',
		'S.P....P....C....P....P....E',
		'=====....=========....=======',
		'......O....W....*............'
	]
});
