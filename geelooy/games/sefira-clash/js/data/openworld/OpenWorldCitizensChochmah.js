//B"H
//Boruch Hashem
//Blessed is He

/** Chochmah citizens reveal first insight, repeatable pattern, and courageous crossing. */

import { worldCitizen as citizen } from './OpenWorldCitizenFactory.js';

export const CHOCHMAH_CITIZENS = Object.freeze([
	citizen(
		'shlomo-scholar',
		'Shlomo of First Insight',
		'chochmah',
		'scholar',
		'archive',
		'guesthouse',
		190,
		'An idea arrives whole. The work is building a vessel for it.'
	),
	citizen(
		'ari-artisan',
		'Ari the Pattern Maker',
		'chochmah',
		'artisan',
		'market',
		'guesthouse',
		202,
		'A new pattern is only useful when another hand can repeat it.'
	),
	citizen(
		'rivka-ferry',
		'Rivka of the Bright Crossing',
		'chochmah',
		'ferryman',
		'ferry',
		'guesthouse',
		176,
		'Sometimes the road appears only after you begin crossing.'
	)
]);
