// B"H
// Boruch Hashem
// Blessed is He

import { resident, road } from './entities.js';

/**
 * @file Moonwell Hamlet, the first community beyond Yesod's reflected shore.
 * @description The Awtsmoos renews bridge, warden, well, and traveler as one
 * remembered arrival. Awtsmoos.com is recalled here as unfinished pool roads stay
 * visibly sealed while the authored first crossing remains completely playable.
 */

function sealedReflectionPoolRoad() {
	return {
		...road(
			'reflection_pool_road',
			'🔒',
			11,
			4,
			'yesod_reflection_pool',
			2,
			7
		),
		name: 'Sealed Road to the Reflection Pools',
		condition: {
			type: 'completedQuest',
			questId: 'campaign_yesod_02'
		},
		dialogue: {
			start: [
				'The pool road remains sealed until Moonwell’s waters become a lived Chronicle thread.'
			]
		}
	};
}

export const moonwellHamlet = {
	name: 'Moonwell Hamlet',
	regionId: 'yesod',
	width: 13,
	baseLayerString: `
🌙🌙🌙🌙🌙🌙🌙🌙🌙🌙🌙🌙🌙
🌙▫️▫️▫️💧▫️▫️▫️💧▫️▫️▫️🌙
🌙▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🌙
🌙▫️💧▫️▫️▫️▫️▫️▫️▫️💧▫️🌙
🌙▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🌙
🌙▫️💧▫️▫️▫️▫️▫️▫️▫️💧▫️🌙
🌙▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🌙
🌙▫️▫️▫️💧▫️▫️▫️💧▫️▫️▫️🌙
🌙🌙🌙🌙🌙🌙🌙🌙🌙🌙🌙🌙🌙`,
	interactables: {
		shore_return: road(
			'shore_return',
			'⬅️',
			1,
			4,
			'yesod_shore',
			14,
			4
		),
		reflection_pool_road: sealedReflectionPoolRoad(),
		warden_liora: resident(
			'warden_liora',
			'Warden Liora',
			'🌙',
			5,
			3,
			'Moonwater keeps what hurried minds abandon. You crossed by continuity rather than shine.'
		),
		moonwell: resident(
			'moonwell',
			'Silent Moonwell',
			'💧',
			8,
			5,
			'The well reflects every resident, yet remembers none by name.'
		)
	},
	encounters: {}
};
