//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level26 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Beis Bridge forms a two-room house around a guarded connecting span. */
export const level26 = adventureMap({
	no: 26,
	name: 'Beis Bridge',
	theme: 'beis',
	hue: 32,
	difficulty: 'Hard',
	description: 'Cross between two house chambers while defenders hold the doorway.',
	idea: 'Room-to-room combat emphasizes spacing before a narrow bridge push.',
	objective: { type: 'defeat' },
	exit: 'Defeat both house guards and leave through the second chamber.',
	progression: ['room spacing', 'doorway pressure', 'bridge launch'],
	enemies: ['Beis Guard Left', 'Beis Guard Right'],
	rows: [
		'P..###...P.....P...###..P...',
		'S..B....###..C..###....K..E',
		'=======....======....=======',
		'....O......W..*......P......'
	]
});
