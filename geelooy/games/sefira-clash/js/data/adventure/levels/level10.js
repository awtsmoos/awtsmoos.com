//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the level10 vessel in this instant, revealing
 * its focused js data adventure levels service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { adventureMap } from '../adventureFactory.js';

/** B"H — Level 10 is the first crown hill mastery gate, manually composed. */
export const level10 = adventureMap({
	no: 10,
	name: 'Kesser Crown Hill',
	difficulty: 'Medium',
	theme: 'mountain',
	hue: 55,
	description:
		'A crown-shaped hill combines climbing, weapon timing, and a stomp-friendly finish.',
	idea: 'Close the first ten levels with a recognizable summit silhouette and two-stage combat.',
	progression: [
		'safe approach Spark',
		'climb the crown teeth',
		'choose hidden Spark or weapon line',
		'stomp the final hill guard'
	],
	enemies: ['Kelipah Walker guards the lower tooth; Iron Shell waits on the crown lip.'],
	powerups: ['Spark of Kesser sits on the approach; hidden Spark hides beneath the crown tooth.'],
	weapons: ['Crown Staff is between the two enemies so carrying it to the top feels earned.'],
	secrets: [
		'Hidden Spark under the central tooth requires a deliberate drop before the final climb.'
	],
	rows: [
		'S   O             ',
		'=====      B      ',
		'     ##       ##  ',
		'        * W       ',
		'      ====    B   ',
		'   ##       ===== ',
		'=================='
	]
});
