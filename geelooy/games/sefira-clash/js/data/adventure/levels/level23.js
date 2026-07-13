//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level23 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Temple Echo repeats one combat room at three heights with changing exits. */
export const level23 = adventureMap({
	no: 23,
	name: 'Temple Echo',
	theme: 'temple',
	hue: 44,
	difficulty: 'Hard',
	description: 'Ascend three echo chambers whose geometry repeats but threats evolve.',
	idea: 'Familiar platforms support increasingly difficult enemy positioning.',
	objective: { type: 'defeat' },
	exit: 'Defeat all temple echoes and claim the upper gate.',
	progression: ['repeat mastery', 'upward launch', 'platform chase'],
	enemies: ['First Echo', 'Second Echo'],
	rows: [
		'.......................E',
		'.................K..###P',
		'............###..P......',
		'......B..###..C..P.......',
		'S.P..###....P......O.....',
		'======....======....=====',
		'.........*....W..........'
	]
});
