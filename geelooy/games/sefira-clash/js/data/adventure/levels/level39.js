//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level39 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Samech Circle creates a closed arena loop with treasure on every quadrant. */
export const level39 = adventureMap({
	no: 39,
	name: 'Samech Circle',
	theme: 'circle',
	hue: 84,
	difficulty: 'Expert',
	description: 'Run a complete circuit while two guards attack from opposite arcs.',
	idea: 'Circular pursuit rewards turnarounds, cutoffs, and center shortcuts.',
	objective: { type: 'collect-and-defeat', perutas: 8 },
	exit: 'Collect eight circle Perutas and defeat both arc guardians.',
	progression: ['circular pursuit', 'cutoff', 'center shortcut'],
	enemies: ['Upper Arc', 'Lower Arc'],
	rows: [
		'P..###..P.....P..###..P.....',
		'...B......O......K..........',
		'S.P..###..C..###..P.......E',
		'=====....======....========',
		'..P....*....W....P..........'
	]
});
