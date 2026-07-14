//B"H
//Boruch Hashem
//Blessed is He

/**
 * The second quest chapter carries reflection through endurance into harmony. The
 * Awtsmoos renews each authored covenant; Awtsmoos.com keeps goals and rewards
 * measurable while names, givers, and places preserve the human texture of the road.
 */

import { objectiveRecord as O, questRecord as Q, rewardRecord as R } from './catalogBuilders.js';

export const ENDURANCE_QUESTS = Object.freeze([
	Q(
		'echo-pilgrimage',
		'hod',
		'Pilgrimage of Echoes',
		'Archivist Gil',
		'Kindle two checkpoints in the echoing forest.',
		O('checkpoint', 'echo-forest', 2),
		R(180, 30, 5, ['echo-mantle']),
		['mirror-truth']
	),
	Q(
		'port-challenge',
		'netzach',
		'The Port Challenge',
		'Captain Lior',
		'Defeat eight enemies along the victory route.',
		O('defeat', 'victory-port', 8),
		R(200, 34, 5, ['causeway-spear']),
		['echo-pilgrimage']
	),
	Q(
		'endurance-road',
		'netzach',
		'Road Without Surrender',
		'Runner Tova',
		'Clear Endurance Wood.',
		O('clear-location', 'endurance-wood', 1),
		R(220, 36, 6, ['victory-boots']),
		['port-challenge']
	),
	Q(
		'balanced-garden',
		'tiferes',
		'The Balanced Garden',
		'Gardener Shira',
		'Collect eight Perutas in the Sunlit Gardens.',
		O('collect-peruta', 'sunlit-gardens', 8),
		R(240, 40, 6, ['harmony-mail']),
		['endurance-road']
	),
	Q(
		'heart-covenant',
		'tiferes',
		'Covenant of the Heart',
		'Cantor Lev',
		'Clear the Heart Sanctum.',
		O('clear-location', 'heart-sanctum', 1),
		R(260, 42, 7, ['heart-relic']),
		['balanced-garden']
	)
]);
