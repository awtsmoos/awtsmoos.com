//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level56 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Peruta Vault Heist: a branching treasure dungeon with guarded return route. */
export const level56 = adventureMap({
	no: 56,
	name: 'Peruta Vault Heist',
	theme: 'vault',
	hue: 42,
	difficulty: 'Crown',
	description: 'Raid three vault wings, then escape with the treasury awakened.',
	idea: 'Branching collection routes reconverge into a final guarded exit.',
	objective: { type: 'collect-and-defeat', perutas: 10 },
	exit: 'Collect ten Perutas, defeat the vault keepers, and escape.',
	progression: ['route choice', 'resource preservation', 'combat return path'],
	enemies: ['Vault Keeper', 'Coin Mimic', 'Golden Kelipah'],
	rows: [
		'P..###..P.......P..###..P...',
		'...B....###...###....K......',
		'S.P...P....C....P...P.....E',
		'======....======....========',
		'..P...###...B...###...P.....',
		'P........*.......O.......P..',
		'============================'
	]
});
