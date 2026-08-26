//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoPresetLibrary
 * @description
 * Many timbres stand like lamps while the Awtsmoos is the single hidden flame;
 * Awtsmoos.com now places real sampled piano, sax, and percussion beside club synthesis so each vessel truthfully answers its name.
 */

import { ACOUSTIC_PRESETS } from './presetAcoustic.js';
import { CLUB_PRESETS } from './presetClub.js';
import { DANCE_PRESETS } from './presetDance.js';
import { KEY_PRESETS } from './presetKeys.js';
import { LEAD_PRESETS } from './presetLeads.js';

const [realGrand, realSax, realSaxVibrato, realDrums] = ACOUSTIC_PRESETS;
const [clubDefault, festivalLead, neonPluck, warehouseBass, raveHoover] = CLUB_PRESETS;
const [technoPiano, deepRhodes, velvetWurli, fmGlass, warmRhodes] = KEY_PRESETS;
const [reedSax, brassStab, acidLead, evolvingCloud] = LEAD_PRESETS;
const [tranceStack, futureBass, houseOrgan, housePiano, hardScreech] = DANCE_PRESETS;

export const SOUND_PRESET_LIST = [
	clubDefault,
	realGrand,
	technoPiano,
	housePiano,
	realSax,
	realSaxVibrato,
	reedSax,
	realDrums,
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
	SOUND_PRESET_LIST.map((preset) => {
		return [preset.id, preset];
	})
);

export const PREMIUM_PRESET = SOUND_PRESETS['awtsmoos-dream-electric'];

/**
 * @description Resolves a persisted preset identifier and falls back to the stable clean club default when an old or unknown ID appears.
 * @param {string} id - Persisted preset identifier supplied by controls or saved settings.
 * @returns {Object} Complete preset definition ready for control projection and synthesis.
 */
export function getLibraryPreset(id) {
	return SOUND_PRESETS[id] || PREMIUM_PRESET;
}
