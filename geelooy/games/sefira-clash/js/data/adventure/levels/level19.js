//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level19 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Beauty Rings use three circular-feeling lanes around a central checkpoint. */
export const level19 = adventureMap({
	no: 19,
	name: 'Beauty Rings',
	theme: 'garden',
	hue: 48,
	difficulty: 'Medium',
	description: 'Trace three balanced rings of platforms, treasure, and aerial combat.',
	idea: 'A central checkpoint supports multiple ordered collection routes.',
	objective: { type: 'collect', perutas: 7 },
	exit: 'Complete the seven-Peruta ring and leave through the balanced gate.',
	progression: ['route choice', 'aerial drift', 'center return'],
	enemies: ['Ring Dancer'],
	rows: [
		'....P..###.....###..P........',
		'.P........B.O........P.......',
		'S..###..P..C..P..###.......E',
		'====....=======....=========',
		'....P.....*.....P............'
	]
});
