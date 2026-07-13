//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level53 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Gravity Orchard: treasure hangs above pits in a deliberate aerial circuit. */
export const level53 = adventureMap({
	no: 53,
	name: 'Gravity Orchard',
	theme: 'orchard',
	hue: 112,
	difficulty: 'Master',
	description: 'Harvest every golden fruit while gravity lanes pull fights apart.',
	idea: 'Perutas form an aerial loop with one safe checkpoint at its center.',
	objective: { type: 'collect', perutas: 9 },
	exit: 'Harvest nine Perutas and return to the orchard gate.',
	progression: ['double jump routes', 'fall control', 'aerial attacks'],
	enemies: ['Root Kelipah', 'Falling Thorn'],
	rows: [
		'.........P.....P.....P.....',
		'.....###.....###.....###..E',
		'..P.......B......P.........',
		'###....###....C....###.....',
		'S..P.....K....P......*.....',
		'====....====....====....====',
		'....P........P........O.....'
	]
});
