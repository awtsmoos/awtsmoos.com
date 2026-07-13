//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level20 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Crown Switch closes the second world with a two-tier guardian encounter. */
export const level20 = adventureMap({
	no: 20,
	name: 'Crown Switch',
	theme: 'crown',
	hue: 52,
	difficulty: 'Medium',
	description: 'Cross the lower crown, activate its center, and defeat the upper guard.',
	idea: 'A checkpoint switch divides traversal from a final elevated duel.',
	objective: { type: 'boss' },
	exit: 'Defeat the Crown Switch guardian.',
	progression: ['checkpoint route', 'platform chase', 'boss launch'],
	enemies: ['Crown Switch Guardian'],
	rows: [
		'..................K..###..E',
		'............P..###..P......',
		'......P..###..C..###........',
		'S.P.###......W......###..P..',
		'======....========....======',
		'.........O....*....P........'
	]
});
