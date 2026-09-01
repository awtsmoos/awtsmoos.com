//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoPresetLibrary
 * @description
 * Many timbres stand like lamps while the Awtsmoos is the single hidden flame;
 * Awtsmoos.com gathers sampled truth, club synthesis, Wet space, classic archetypes, performance colors, and textures into one stable river of name.
 */

import { ACOUSTIC_PRESETS } from './presetAcoustic.js';
import { CLASSIC_SYNTH_PRESETS } from './presetClassicSynths.js';
import { CLUB_PRESETS } from './presetClub.js';
import { DANCE_PRESETS } from './presetDance.js';
import { KEY_PRESETS } from './presetKeys.js';
import { LEAD_PRESETS } from './presetLeads.js';
import { PERFORMANCE_PRESETS } from './presetPerformance.js';
import { TEXTURE_PRESETS } from './presetTextures.js';
import { WET_KEY_PRESETS } from './presetWetKeys.js';
import { WET_SYNTH_PRESETS } from './presetWetSynths.js';

const [realGrand, realSax, realSaxVibrato, realDrums] = ACOUSTIC_PRESETS;
const [clubDefault, festivalLead, neonPluck, warehouseBass, raveHoover] = CLUB_PRESETS;
const [technoPiano, deepRhodes, velvetWurli, fmGlass, warmRhodes] = KEY_PRESETS;
const [reedSax, brassStab, acidLead, evolvingCloud] = LEAD_PRESETS;
const [tranceStack, futureBass, houseOrgan, housePiano, hardScreech] = DANCE_PRESETS;

export const SOUND_PRESET_LIST = [
	clubDefault,
	...WET_KEY_PRESETS,
	...WET_SYNTH_PRESETS,
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
	evolvingCloud,
	...CLASSIC_SYNTH_PRESETS,
	...PERFORMANCE_PRESETS,
	...TEXTURE_PRESETS
];

export const SOUND_PRESETS = Object.fromEntries(
	SOUND_PRESET_LIST.map((preset) => {
		return [preset.id, preset];
	})
);

export const PREMIUM_PRESET = SOUND_PRESETS['awtsmoos-dream-electric'];

/** @param {string} id - Persisted or selected preset ID. @returns {Object} Complete preset record. */
export function getLibraryPreset(id) {
	return SOUND_PRESETS[id] || PREMIUM_PRESET;
}
