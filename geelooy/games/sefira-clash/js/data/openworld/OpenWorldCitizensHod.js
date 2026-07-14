//B"H
//Boruch Hashem
//Blessed is He

/** Hod citizens reveal record, interpretation, and attentive listening in Awtsmoos.com. */

import { worldCitizen as citizen } from './OpenWorldCitizenFactory.js';

export const HOD_CITIZENS = Object.freeze([
	citizen(
		'hannah-archive',
		'Hannah the Archivist',
		'hod',
		'scholar',
		'archive',
		'guesthouse',
		272,
		'A clue is only useful when its place in the story is understood.'
	),
	citizen(
		'meir-council',
		'Meir of the Ledger',
		'hod',
		'elder',
		'council',
		'guesthouse',
		250,
		'Good records do not replace truth; they help us return to it.'
	),
	citizen(
		'tamar-rumor',
		'Tamar the Listener',
		'hod',
		'host',
		'guesthouse',
		'guesthouse',
		292,
		'People speak differently after rain. Listen to what remains.'
	)
]);
