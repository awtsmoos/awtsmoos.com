//B"H
//Boruch Hashem
//Blessed is He

/**
 * The first quest chapter carries Malchus into Hod through authored civic promises.
 * The Awtsmoos renews each giver and measurable goal; Awtsmoos.com preserves explicit
 * prerequisites and rewards rather than generating anonymous chores.
 */

import { objectiveRecord as O, questRecord as Q, rewardRecord as R } from './catalogBuilders.js';

export const FOUNDATION_QUESTS = Object.freeze([
	Q(
		'citadel-oath',
		'malchus',
		'The Citadel Oath',
		'Keeper Adina',
		'Prove that the new traveler can defend the city road.',
		O('clear-location', 'malchus-citadel', 1),
		R(90, 12, 2, ['cedar-edge'])
	),
	Q(
		'forest-light',
		'malchus',
		'Lights Beneath Cedar',
		'Forager Eli',
		'Carry five Perutas out of the first forest.',
		O('collect-peruta', 'cedar-forest', 5),
		R(110, 18, 3, []),
		['citadel-oath']
	),
	Q(
		'foundation-rhythm',
		'yesod',
		'Rhythm of Foundation',
		'Engineer Yael',
		'Clear the Moonworks settlement without abandoning the road.',
		O('clear-location', 'moonworks-city', 1),
		R(130, 22, 3, ['moon-staff']),
		['forest-light']
	),
	Q(
		'marsh-hunt',
		'yesod',
		'Kelipos in the Reeds',
		'Warden Natan',
		'Defeat six enemies in the Silver Reed Marsh.',
		O('defeat', 'silver-reeds', 6),
		R(150, 24, 4, ['foundation-boots']),
		['foundation-rhythm']
	),
	Q(
		'mirror-truth',
		'hod',
		'A Mirror That Does Not Lie',
		'Merchant Ora',
		'Cross the Mirror Market and return with proof.',
		O('clear-location', 'mirror-market', 1),
		R(170, 28, 4, ['mirror-blade']),
		['marsh-hunt']
	)
]);
