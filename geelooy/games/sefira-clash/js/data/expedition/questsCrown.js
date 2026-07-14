//B"H
//Boruch Hashem
//Blessed is He

/**
 * The final quest chapter carries understanding through storm into unity. The
 * Awtsmoos renews every last promise; Awtsmoos.com keeps the crown road authored,
 * measurable, and connected to named covenant gear rather than generic endgame loot.
 */

import { objectiveRecord as O, questRecord as Q, rewardRecord as R } from './catalogBuilders.js';

export const CROWN_QUESTS = Object.freeze([
	Q(
		'tower-thread',
		'binah',
		'Thread Through the Tower',
		'Scribe Amos',
		'Clear the Tower of Forms.',
		O('clear-location', 'tower-forms', 1),
		R(380, 60, 10, ['labyrinth-relic']),
		['forms-understood']
	),
	Q(
		'storm-answer',
		'chochmah',
		'Answer the Storm',
		'Scout Noa',
		'Defeat twelve enemies across the storm camp.',
		O('defeat', 'storm-camp', 12),
		R(400, 64, 10, ['storm-gauntlet']),
		['tower-thread']
	),
	Q(
		'lightning-path',
		'chochmah',
		'The Lightning Path',
		'Seer Avi',
		'Clear Lightning Wood.',
		O('clear-location', 'lightning-wood', 1),
		R(430, 68, 11, ['lightning-boots']),
		['storm-answer']
	),
	Q(
		'crown-road',
		'keser',
		'The Crown Road',
		'Elder Rina',
		'Clear Crown City.',
		O('clear-location', 'crown-city', 1),
		R(470, 74, 12, ['crown-armor', 'unbounded-mantle']),
		['lightning-path']
	),
	Q(
		'unity-return',
		'keser',
		'The Return into Unity',
		'The Silent Keeper',
		'Clear the Road Beyond the Throne.',
		O('clear-location', 'throne-road', 1),
		R(600, 100, 15, ['unity-relic']),
		['crown-road']
	)
]);
