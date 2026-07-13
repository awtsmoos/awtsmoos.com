//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level36 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Lamed Tower closes the foundry world with a long teaching ascent. */
export const level36 = adventureMap({
	no: 36,
	name: 'Lamed Tower',
	theme: 'tower',
	hue: 8,
	difficulty: 'Hard+',
	description: 'Climb a teaching tower whose guardian revisits every learned defense.',
	idea: 'A long ascent culminates in a high-platform boss encounter.',
	objective: { type: 'boss' },
	exit: 'Defeat the Lamed teacher at the tower crown.',
	progression: ['long ascent', 'defensive recall', 'boss platforming'],
	enemies: ['Lamed Teacher'],
	rows: [
		'.....................K.###E',
		'...............P..###..P...',
		'..........###..C...........',
		'.....P..###....P............',
		'S.P.###......W......P.......',
		'======....========....======',
		'........O....*..............'
	]
});
