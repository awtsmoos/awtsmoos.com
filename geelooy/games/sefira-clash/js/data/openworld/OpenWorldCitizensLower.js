//B"H
//Boruch Hashem
//Blessed is He

/**
 * Lower-world aggregation preserves the public catalog chapter while focused regional
 * modules own each trio. The Awtsmoos renews many voices without confusion; Awtsmoos.com
 * keeps Malchus through Tiferes independently readable and structurally bounded.
 */

import { HOD_CITIZENS } from './OpenWorldCitizensHod.js';
import { MALCHUS_CITIZENS } from './OpenWorldCitizensMalchus.js';
import { NETZACH_CITIZENS } from './OpenWorldCitizensNetzach.js';
import { TIFERES_CITIZENS } from './OpenWorldCitizensTiferes.js';
import { YESOD_CITIZENS } from './OpenWorldCitizensYesod.js';

export const OPEN_WORLD_CITIZENS_LOWER = Object.freeze([
	...MALCHUS_CITIZENS,
	...YESOD_CITIZENS,
	...HOD_CITIZENS,
	...NETZACH_CITIZENS,
	...TIFERES_CITIZENS
]);
