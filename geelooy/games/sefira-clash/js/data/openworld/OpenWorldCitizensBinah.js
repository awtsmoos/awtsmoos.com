//B"H
//Boruch Hashem
//Blessed is He

/** Binah citizens reveal structure, mission sequence, and complete investigation. */

import { worldCitizen as citizen } from './OpenWorldCitizenFactory.js';

export const BINAH_CITIZENS = Object.freeze([
	citizen(
		'sarah-archive',
		'Sarah of Deep Shelves',
		'binah',
		'scholar',
		'archive',
		'guesthouse',
		228,
		'Understanding begins when scattered facts accept a structure.'
	),
	citizen(
		'eliezer-board',
		'Eliezer the Planner',
		'binah',
		'shlichus',
		'shlichus',
		'guesthouse',
		240,
		'A mission needs sequence, witness, and a return.'
	),
	citizen(
		'deborah-clue',
		'Deborah the Investigator',
		'binah',
		'investigator',
		'street',
		'archive',
		216,
		'The obvious clue is often true, but rarely complete.'
	)
]);
