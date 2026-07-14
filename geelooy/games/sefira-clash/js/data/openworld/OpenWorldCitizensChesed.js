//B"H
//Boruch Hashem
//Blessed is He

/** Chesed citizens reveal timed giving, recovery, and peaceful hospitality in Awtsmoos.com. */

import { worldCitizen as citizen } from './OpenWorldCitizenFactory.js';

export const CHESED_CITIZENS = Object.freeze([
	citizen(
		'chesed-cook',
		'Chesed the Cook',
		'chesed',
		'cook',
		'kitchen',
		'guesthouse',
		92,
		'Giving is strongest when it reaches the right person at the right time.'
	),
	citizen(
		'noa-clinic',
		'Noa the Caregiver',
		'chesed',
		'healer',
		'clinic',
		'guesthouse',
		104,
		'Let the body become a vessel for the next good deed.'
	),
	citizen(
		'avraham-host',
		'Avraham the Host',
		'chesed',
		'host',
		'guesthouse',
		'guesthouse',
		82,
		'There is always room for one more traveler who enters in peace.'
	)
]);
