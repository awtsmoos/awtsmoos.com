//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level48 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Heichal Seven joins seven compact halls into one escalating temple trial. */
export const level48 = adventureMap({
	no: 48,
	name: 'Heichal Seven',
	theme: 'heichal',
	hue: 284,
	difficulty: 'Master',
	description: 'Cross seven halls whose enemies and traversal rhythm change each time.',
	idea: 'Seven micro-encounters create a long-form mastery sequence.',
	objective: { type: 'collect-and-defeat', perutas: 9 },
	exit: 'Collect nine hall Perutas and defeat the seventh-heichal guardian.',
	progression: ['micro encounters', 'resource pacing', 'hall transition'],
	enemies: ['Hall Guard', 'Seventh Guardian'],
	rows: [
		'P.##.P.##.P.##.P.##.P.##.P',
		'S.B...P...C...P...K...P..E',
		'===.===.===.===.===.===.===',
		'..O...P...W...*...P...P....'
	]
});
