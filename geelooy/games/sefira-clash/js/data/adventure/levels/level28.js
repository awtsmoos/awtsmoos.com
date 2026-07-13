//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level28 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Daled Doors offers four entrances but only one efficient treasure route. */
export const level28 = adventureMap({
	no: 28,
	name: 'Daled Doors',
	theme: 'doors',
	hue: 274,
	difficulty: 'Hard',
	description: 'Four door-like chambers hide treasure behind different combat costs.',
	idea: 'A branching dungeon rewards scouting and intentional route choice.',
	objective: { type: 'collect-and-defeat', perutas: 6 },
	exit: 'Collect six doorway Perutas and defeat the false-door keeper.',
	progression: ['branch choice', 'ambush defense', 'checkpoint planning'],
	enemies: ['False Door Keeper'],
	rows: [
		'P.###..P.###....P.###..P.###',
		'S...B......P..C......K.....E',
		'====..====..====..====..====',
		'..O....P....*....W....P.....',
		'============================='
	]
});
