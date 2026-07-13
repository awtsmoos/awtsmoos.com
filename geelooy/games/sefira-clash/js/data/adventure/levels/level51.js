//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level51 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Mirror Step Labyrinth: reflection routes become embodied decisions. */
export const level51 = adventureMap({
	no: 51,
	name: 'Mirror Step Labyrinth',
	theme: 'mirror',
	hue: 286,
	difficulty: 'Master',
	description: 'Split paths mirror each other until Perutas reveal the true exit.',
	idea: 'Alternating high and low lanes force direction changes under pressure.',
	objective: { type: 'collect-and-defeat', perutas: 7 },
	exit: 'Collect seven Perutas, defeat the mirror guard, and reach the prism exit.',
	progression: ['dash turn', 'short hop', 'shield timing', 'route reading'],
	enemies: ['Mirror Kelipah', 'Prism Guard'],
	secrets: ['A hidden Spark floats beneath the false upper route.'],
	rows: [
		'....................*........',
		'.........P....###.......O....',
		'....###.......B....###.......',
		'.S..P..###..P...C..P...###..E',
		'=====....=====....=====....===',
		'..P...###....K....###...P....',
		'==========..P..==============='
	]
});
