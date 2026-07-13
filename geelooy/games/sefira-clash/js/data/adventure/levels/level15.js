//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level15 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Judgment Stairs place shield timing on a narrow ascending gauntlet. */
export const level15 = adventureMap({
	no: 15,
	name: 'Judgment Stairs',
	theme: 'judgment',
	hue: 4,
	difficulty: 'Medium',
	description: 'Climb red stairs while two judges attack from opposite elevations.',
	idea: 'Narrow landings make defense, parry timing, and launch direction matter.',
	objective: { type: 'defeat' },
	exit: 'Defeat both judges and stand at the upper verdict gate.',
	progression: ['parry window', 'upward attacks', 'ledge restraint'],
	enemies: ['Lower Judge', 'Upper Judge'],
	rows: [
		'.......................E',
		'.................K..###P',
		'...........P..###.......',
		'......B..###..C..P.......',
		'S.P..###...........P.....',
		'======....======....====='
	]
});
