//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level60 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Awtsmoos Unbounded: the final arena synthesizes the complete campaign grammar. */
export const level60 = adventureMap({
	no: 60,
	name: 'Awtsmoos Unbounded',
	theme: 'unbounded',
	hue: 52,
	difficulty: 'Final Crown',
	description: 'Every road returns to one immense final battlefield beyond division.',
	idea: 'Movement, treasure, checkpoints, weapons, secrets, and combat converge.',
	objective: { type: 'collect-and-defeat', perutas: 10 },
	exit: 'Unite ten Perutas, defeat the final vessels, and cross the crown of light.',
	progression: [
		'complete movement',
		'complete defense',
		'complete combat',
		'complete exploration'
	],
	enemies: ['Final Kelipah', 'Crown Echo', 'Unbounded Shadow'],
	secrets: ['Two hidden Sparks rest below the visible crown route.'],
	rows: [
		'...........O.......O...........E',
		'.....P..###..K..###..B..###..P.',
		'..###.......P.......P.......###.',
		'S.P..B..C..P..W..P..C..K..P....',
		'======....======....======....===',
		'..P..###..*..B..*..###..P.......',
		'P....O....P....K....P....O....P.',
		'================================='
	]
});
