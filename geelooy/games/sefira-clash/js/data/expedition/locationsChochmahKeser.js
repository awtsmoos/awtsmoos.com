//B"H
//Boruch Hashem
//Blessed is He

/**
 * Chochmah and Keser locations carry sudden insight toward the final crown. The
 * Awtsmoos renews camp, wood, rift, city, grove, and throne road; Awtsmoos.com binds
 * each authored place to a real gate and explicit culmination.
 */

import { locationRecord as L } from './catalogBuilders.js';

export const CHOCHMAH_KESER_LOCATIONS = Object.freeze([
	L(
		'storm-camp',
		'chochmah',
		49,
		'settlement',
		'Storm Camp',
		'Travelers shelter beneath kites that read the wind.',
		'tower-forms',
		'lightning-wood'
	),
	L(
		'lightning-wood',
		'chochmah',
		51,
		'wilderness',
		'Lightning Wood',
		'Sudden insight arrives as broken ground and violent air.',
		'storm-camp',
		'wisdom-rift'
	),
	L(
		'wisdom-rift',
		'chochmah',
		54,
		'climax',
		'Rift of Wisdom',
		'A shattered world rewards immediate understanding.',
		'lightning-wood',
		'crown-city'
	),
	L(
		'crown-city',
		'keser',
		55,
		'settlement',
		'Crown City',
		'Every prior region sends one road toward the final height.',
		'wisdom-rift',
		'unbounded-grove'
	),
	L(
		'unbounded-grove',
		'keser',
		57,
		'wilderness',
		'Unbounded Grove',
		'All learned verbs return without their old boundaries.',
		'crown-city',
		'throne-road'
	),
	L(
		'throne-road',
		'keser',
		60,
		'climax',
		'Road Beyond the Throne',
		'The final passage unifies the entire expedition.',
		'unbounded-grove',
		null
	)
]);
