//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level18 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Victory Causeway is a speed road interrupted by two deliberate duels. */
export const level18 = adventureMap({
	no: 18,
	name: 'Victory Causeway',
	theme: 'causeway',
	hue: 126,
	difficulty: 'Medium',
	description: 'Maintain forward momentum across a long road without outrunning danger.',
	idea: 'Two duel pockets punctuate a dash-heavy traversal challenge.',
	objective: { type: 'collect-and-defeat', perutas: 6 },
	exit: 'Defeat both road challengers and bring six Perutas to the banner.',
	progression: ['dash rhythm', 'whiff punish', 'forward recovery'],
	enemies: ['Causeway Challenger', 'Victory Guard'],
	rows: [
		'...P......P......P......O....',
		'S....B..###..C..###..K.....E',
		'========....========....=====',
		'..P....W......*......P....P..'
	]
});
