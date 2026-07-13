//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level40 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Ayin Eye Climb watches the player through a hollow central tower. */
export const level40 = adventureMap({
	no: 40,
	name: 'Ayin Eye Climb',
	theme: 'eye',
	hue: 282,
	difficulty: 'Expert',
	description: 'Climb around a hollow eye while a watcher controls its pupil platform.',
	idea: 'An outer ascent and central shortcut create risk-reward route choices.',
	objective: { type: 'boss' },
	exit: 'Defeat the Ayin Watcher and cross the upper eyelid gate.',
	progression: ['outer climb', 'center shortcut', 'boss read'],
	enemies: ['Ayin Watcher'],
	rows: [
		'....................K..###E',
		'.....P..###.....###..P.....',
		'..###......P.C.P......###..',
		'S.P.....###...###.....P....',
		'======....=====....========',
		'........O...*...W...........'
	]
});
