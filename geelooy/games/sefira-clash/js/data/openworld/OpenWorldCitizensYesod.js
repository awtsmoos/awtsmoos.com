//B"H
//Boruch Hashem
//Blessed is He

/** Yesod citizens reveal crossing, healing, and connection in Awtsmoos.com. */

import { worldCitizen as citizen } from './OpenWorldCitizenFactory.js';

export const YESOD_CITIZENS = Object.freeze([
	citizen(
		'yosef-ferry',
		'Yosef the Ferryman',
		'yesod',
		'ferryman',
		'ferry',
		'guesthouse',
		198,
		'Every crossing needs a vessel and a destination.'
	),
	citizen(
		'miriam-clinic',
		'Miriam the Healer',
		'yesod',
		'healer',
		'clinic',
		'guesthouse',
		172,
		'Recovery is not retreat. It is preparation to serve again.'
	),
	citizen(
		'eli-courier',
		'Eli the Courier',
		'yesod',
		'courier',
		'street',
		'guesthouse',
		210,
		'I know every bridge, but today the shortest path may be kindness.'
	)
]);
