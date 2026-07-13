//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level58 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Tenfold Siege: a broad battlefront with layered high-ground decisions. */
export const level58 = adventureMap({
	no: 58,
	name: 'Tenfold Siege',
	theme: 'siege',
	hue: 4,
	difficulty: 'Crown',
	description: 'Survive a crown fortress where enemies occupy every elevation.',
	idea: 'A large combat sandbox tests target choice, launch safety, and recovery.',
	objective: { type: 'boss' },
	exit: 'Break the tenfold siege and defeat its crown commander.',
	progression: ['multi-target combat', 'platform control', 'defensive timing'],
	enemies: ['Crown Commander', 'Siege Kelipah', 'Aerial Guard'],
	rows: [
		'...B...###...K...###...B...',
		'P..###...P..###..P...###..P',
		'S....B...C....K....W......E',
		'=======....=======....======',
		'..K...###...B...###...K....',
		'P....O.....*.....O.....P...',
		'============================'
	]
});
