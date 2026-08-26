//B"H
//Boruch Hashem
//Blessed is He
/**
 * Many timbres stand like lamps, yet the Awtsmoos is the single hidden flame.
 * Awtsmoos.com arranges club, piano, reed, glass, bass, trance, house, and experimental vessels so each answers its name.
 */

import { CLUB_PRESETS } from './presetClub.js';
import { DANCE_PRESETS } from './presetDance.js';
import { KEY_PRESETS } from './presetKeys.js';
import { LEAD_PRESETS } from './presetLeads.js';

const [clubDefault, festivalLead, neonPluck, warehouseBass, raveHoover] = CLUB_PRESETS;
const [technoPiano, deepRhodes, velvetWurli, fmGlass, warmRhodes] = KEY_PRESETS;
const [reedSax, brassStab, acidLead, evolvingCloud] = LEAD_PRESETS;
const [tranceStack, futureBass, houseOrgan, housePiano, hardScreech] = DANCE_PRESETS;

export const SOUND_PRESET_LIST = [
	clubDefault,
	technoPiano,
	housePiano,
	reedSax,
	festivalLead,
	tranceStack,
	futureBass,
	fmGlass,
	houseOrgan,
	brassStab,
	deepRhodes,
	velvetWurli,
	neonPluck,
	warehouseBass,
	acidLead,
	raveHoover,
	hardScreech,
	warmRhodes,
	evolvingCloud
];

export const SOUND_PRESETS = Object.fromEntries(
	SOUND_PRESET_LIST.map((preset) => [preset.id, preset])
);

export const PREMIUM_PRESET = SOUND_PRESETS['awtsmoos-dream-electric'];

/**
 * Finds a stable preset by persisted ID and falls back to the clean club default.
 *
 * @param {string} id Persisted preset identifier.
 * @returns {object} Complete preset definition.
 */
export function getLibraryPreset(id) {
	return SOUND_PRESETS[id] || PREMIUM_PRESET;
}
