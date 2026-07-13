//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level32 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** Ches Bridge Trial creates a protected underbridge and dangerous crown lane. */
export const level32 = adventureMap({
	no: 32,
	name: 'Ches Bridge Trial',
	theme: 'bridge',
	hue: 42,
	difficulty: 'Hard+',
	description: 'Choose the guarded bridge or the exposed crown path above it.',
	idea: 'Two stacked routes reward tactical switching through central gaps.',
	objective: { type: 'collect', perutas: 7 },
	exit: 'Carry seven bridge Perutas to the sealed eastern arch.',
	progression: ['route switching', 'drop-through', 'recovery bridge'],
	enemies: ['Bridge Examiner'],
	rows: [
		'P..###..P..###..P..###..P..',
		'S......B....C.....P.......E',
		'======....======....========',
		'..P....O.....*....W....P....',
		'============================'
	]
});
