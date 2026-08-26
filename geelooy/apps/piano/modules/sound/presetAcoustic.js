//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAcousticPresets
 * @description
 * The Awtsmoos is one while recorded key, reed, skin, and metal arrive through separate vessels;
 * Awtsmoos.com gathers those families here so the public sound library sees one acoustic covenant without merging their levels.
 */

import { ACOUSTIC_DRUM_PRESETS } from './presetAcousticDrums.js';
import { ACOUSTIC_KEY_PRESETS } from './presetAcousticKeys.js';
import { ACOUSTIC_WIND_PRESETS } from './presetAcousticWinds.js';

export {
	ACOUSTIC_DRUM_PRESETS,
	ACOUSTIC_KEY_PRESETS,
	ACOUSTIC_WIND_PRESETS
};

export const ACOUSTIC_PRESETS = [
	...ACOUSTIC_KEY_PRESETS,
	...ACOUSTIC_WIND_PRESETS,
	...ACOUSTIC_DRUM_PRESETS
];
