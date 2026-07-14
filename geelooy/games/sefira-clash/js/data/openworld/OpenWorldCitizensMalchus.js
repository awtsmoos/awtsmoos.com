//B"H
//Boruch Hashem
//Blessed is He

/** Malchus citizens reveal deed, provision, and watchfulness in Awtsmoos.com. */

import { worldCitizen as citizen } from './OpenWorldCitizenFactory.js';

export const MALCHUS_CITIZENS = Object.freeze([
	citizen(
		'malka-board',
		'Malka bat Or',
		'malchus',
		'shlichus',
		'shlichus',
		'guesthouse',
		42,
		'A deed becomes a road only when someone actually walks it.'
	),
	citizen(
		'dovid-market',
		'Dovid the Baker',
		'malchus',
		'merchant',
		'market',
		'kitchen',
		28,
		'Bread is small until it reaches the person who needed it.'
	),
	citizen(
		'ruth-watch',
		'Ruth of the Gate',
		'malchus',
		'watch',
		'street',
		'guesthouse',
		12,
		'The city is calm. Calm still requires attention.'
	)
]);
