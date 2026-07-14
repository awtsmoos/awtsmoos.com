//B"H
//Boruch Hashem
//Blessed is He

/**
 * The third quest chapter carries discipline through mercy into understanding. The
 * Awtsmoos renews each named service; Awtsmoos.com keeps every goal tied to a real
 * authored location and each reward tied to durable progression.
 */

import { objectiveRecord as O, questRecord as Q, rewardRecord as R } from './catalogBuilders.js';

export const DISCIPLINE_QUESTS = Object.freeze([
	Q(
		'foundry-law',
		'gevurah',
		'Law of the Foundry',
		'Smith Devorah',
		'Defeat ten enemies in Forgehold.',
		O('defeat', 'forgehold', 10),
		R(280, 46, 7, ['gevurah-axe']),
		['heart-covenant']
	),
	Q(
		'ironwood-armor',
		'gevurah',
		'Armor from Ironwood',
		'Armorer Barak',
		'Clear the Ironwood route.',
		O('clear-location', 'ironwood', 1),
		R(300, 48, 8, ['iron-cuirass']),
		['foundry-law']
	),
	Q(
		'open-hands',
		'chesed',
		'The Open Hands',
		'Healer Miriam',
		'Collect ten Perutas in Mercy Grove.',
		O('collect-peruta', 'mercy-grove', 10),
		R(320, 52, 8, ['mercy-shield']),
		['ironwood-armor']
	),
	Q(
		'river-crossing',
		'chesed',
		'The Living Crossing',
		'Boatwright Yonah',
		'Clear the Bridge of Living Light.',
		O('clear-location', 'bridge-light', 1),
		R(340, 54, 9, ['river-mantle']),
		['open-hands']
	),
	Q(
		'forms-understood',
		'binah',
		'Forms Understood',
		'Architect Leah',
		'Kindle three checkpoints in the Labyrinth Forest.',
		O('checkpoint', 'labyrinth-forest', 3),
		R(360, 58, 9, ['binah-plate']),
		['river-crossing']
	)
]);
