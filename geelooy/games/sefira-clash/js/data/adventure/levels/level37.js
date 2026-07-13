//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level37 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Mem Water Maze uses stacked current-like lanes and generous recovery floors. */
export const level37 = adventureMap({
	no: 37,
	name: 'Mem Water Maze',
	theme: 'water',
	hue: 194,
	difficulty: 'Expert',
	description: 'Navigate flowing upper channels while a lower river catches mistakes.',
	idea: 'Multiple horizontal lanes create route planning without instant failure.',
	objective: { type: 'collect', perutas: 8 },
	exit: 'Find eight water Perutas and leave through the eastern current.',
	progression: ['lane transfer', 'recovery floor', 'route memory'],
	enemies: ['Water Maze Kelipah'],
	rows: [
		'P..###..P....###..P....###P',
		'S.....B...P..C..P.........E',
		'=====..=====..=====..=======',
		'..P....O....P....*....P.....',
		'============================'
	]
});
