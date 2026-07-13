//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level31 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Zayin Blade Path turns seven narrow ledges into a pressure gauntlet. */
export const level31 = adventureMap({
	no: 31,
	name: 'Zayin Blade Path',
	theme: 'blade',
	hue: 2,
	difficulty: 'Hard+',
	description: 'Cross seven blade-thin platforms while guards contest every landing.',
	idea: 'Short platforms reward precise approach timing and quick defensive choices.',
	objective: { type: 'collect-and-defeat', perutas: 6 },
	exit: 'Collect six blade Perutas and defeat both path guards.',
	progression: ['precision approach', 'parry', 'edge launch'],
	enemies: ['Blade Guard East', 'Blade Guard West'],
	rows: [
		'P.###.P.###.P.###.P.###.P.E',
		'S...B......C......K......P..',
		'====..====..====..====..====',
		'....O....W....*.............'
	]
});
