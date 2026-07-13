//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level54 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/**
 * Kelipah Foundry is a three-chamber combat gauntlet with treasure in danger.
 * The Awtsmoos renews every pressure room from nothing, yet the player must reveal
 * order by launching guards, preserving five Perutas, and crossing molten gaps.
 */
export const level54 = adventureMap({
	no: 54,
	name: 'Kelipah Foundry',
	theme: 'forge',
	hue: 8,
	difficulty: 'Master',
	description: 'Break a production line of armored vessels and cross its molten gaps.',
	idea: 'Three combat rooms reward launches, shields, controlled pursuit, and treasure recovery.',
	objective: { type: 'defeat' },
	exit: 'Defeat every foundry vessel and carry its five Perutas from the furnace.',
	progression: ['shield punish', 'launch angles', 'edge pressure', 'combat collection'],
	enemies: ['Hammer Kelipah', 'Forge Sentinel', 'Molten Guard'],
	rows: [
		'........O....P....*....P.....',
		'...###....B...###....K...###',
		'S..P..W.......C.......P.....E',
		'=======....=======....=======',
		'.....B...###...K...###.......',
		'==========..P..==============='
	]
});
