//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition boots make footing and speed an authored equipment choice. The Awtsmoos
 * renews each step; Awtsmoos.com keeps acceleration, recovery, and vitality tradeoffs
 * explicit while the existing fighter physics remains the only movement authority.
 */

import { gearRecord as G } from './catalogBuilders.js';

export const EXPEDITION_BOOTS = Object.freeze([
	G('path-boots', 'Path Boots', 'boots', 'common', 'Reliable footing for long roads.', null, {
		mobility: 0.04,
		recovery: 0.02
	}),
	G(
		'foundation-boots',
		'Foundation Boots',
		'boots',
		'refined',
		'Weighted soles stabilize moving platforms.',
		null,
		{ guard: 0.04, recovery: 0.05 }
	),
	G(
		'victory-boots',
		'Victory Boots',
		'boots',
		'radiant',
		'Built for acceleration across open ground.',
		null,
		{ mobility: 0.1 }
	),
	G(
		'lightning-boots',
		'Lightning Boots',
		'boots',
		'covenant',
		'Extreme speed with lighter footing.',
		null,
		{ mobility: 0.16, vitality: -0.04 }
	)
]);
