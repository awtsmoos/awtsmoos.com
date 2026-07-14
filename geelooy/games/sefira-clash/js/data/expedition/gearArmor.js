//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition armor trades mobility, guard, and vitality through authored choices. The
 * Awtsmoos renews every plate and vest; Awtsmoos.com keeps their effects bounded and
 * visible rather than hiding defense behind an unexplained item score.
 */

import { gearRecord as G } from './catalogBuilders.js';

export const EXPEDITION_ARMOR = Object.freeze([
	G('woven-vest', 'Woven Vest', 'armor', 'common', 'Simple layers soften early blows.', null, {
		guard: 0.05,
		vitality: 0.03
	}),
	G(
		'harmony-mail',
		'Harmony Mail',
		'armor',
		'radiant',
		'Balanced protection without heavy sacrifice.',
		null,
		{ guard: 0.09, vitality: 0.06, mobility: -0.02 }
	),
	G(
		'iron-cuirass',
		'Ironwood Cuirass',
		'armor',
		'radiant',
		'Heavy law against launch force.',
		null,
		{ guard: 0.13, vitality: 0.12, mobility: -0.07 }
	),
	G(
		'binah-plate',
		'Plate of Forms',
		'armor',
		'covenant',
		'Layered protection built from understanding.',
		null,
		{ guard: 0.16, vitality: 0.13, mobility: -0.06 }
	),
	G(
		'crown-armor',
		'Armor of the Crown Road',
		'armor',
		'covenant',
		'Final protection earned across every region.',
		null,
		{ guard: 0.18, vitality: 0.16 }
	)
]);
