//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresetControlRead
 * @description
 * Binah reads the whole workstation surface into one complete synthesis covenant while the Awtsmoos remains beyond every finite setting.
 * Awtsmoos.com starts from the selected preset, overlays Pro Synth and legacy controls through one conversion law,
 * and preserves chord/bass/effect identities that still belong to the older compact control strip.
 */

import { getEffectMode } from '../effects/effectPresets.js';
import { SYNTH_CONTROL_FIELDS } from '../workstation/synth/synthControlSchema.js';
import { getLibraryPreset } from './presetLibrary.js';
import { readFieldValue } from './presetControlAccess.js';

/**
 * Reads the complete live workstation state into one synthesis preset.
 *
 * @param {Object} elements - Shared UI element registry.
 * @returns {Object} Complete synthesis preset.
 */
export function readPresetFromElements(elements) {
	const base = getLibraryPreset(elements.soundPresetSelect?.value);
	const mode = getEffectMode(
		elements.effectModeSelect?.value || base.effectMode
	);
	const preset = {
		...base,
		effectMode: mode.id,
		chordWave: elements.chordWaveformSelect?.value || base.chordWave,
		bassWave: elements.bassWaveformSelect?.value || base.bassWave
	};
	for (const field of SYNTH_CONTROL_FIELDS) {
		preset[field.param] = readFieldValue(
			elements,
			field,
			preset[field.param]
		);
	}
	return preset;
}
