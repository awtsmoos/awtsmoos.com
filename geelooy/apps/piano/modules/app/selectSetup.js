//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppSelectSetup
 * @description
 * The Awtsmoos gives named sound choices visible vessels before a finger makes them sing;
 * Awtsmoos.com fills presets, effects, and waves in one small doorway so bootstrap remains a clear spring.
 */

import { EFFECT_MODE_LIST } from '../effects/effectPresets.js';
import {
	SOUND_PRESET_LIST,
	applyPresetToElements,
	getSoundPreset
} from '../sound/presets.js';
import { ALL_WAVEFORMS } from '../waveforms.js';

export const DEFAULT_PRESET_ID = 'awtsmoos-dream-electric';
const DEFAULT_START_OCTAVE = '0';

/**
 * @description Populates every runtime select and projects the clean default preset before saved settings may override controls.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {void}
 */
export function populateSoundControls(elements) {
	fillSelect(elements.soundPresetSelect, SOUND_PRESET_LIST, 'id', 'label');
	fillSelect(elements.effectModeSelect, EFFECT_MODE_LIST, 'id', 'label');
	[
		elements.waveformSelect,
		elements.waveform2Select,
		elements.chordWaveformSelect,
		elements.bassWaveformSelect
	].forEach(fillWaveSelect);
	setValue(elements.soundPresetSelect, DEFAULT_PRESET_ID);
	applyPresetToElements(elements, getSoundPreset(DEFAULT_PRESET_ID));
	setValue(elements.octaveSelect, DEFAULT_START_OCTAVE);
}

/**
 * @description Rebuilds one generic select from records with explicit value and label keys.
 * @param {HTMLSelectElement|null} select - Select element to populate.
 * @param {Array<Object>} items - Source records.
 * @param {string} valueKey - Record key used as option value.
 * @param {string} labelKey - Record key used as visible label.
 * @returns {void}
 */
function fillSelect(select, items, valueKey, labelKey) {
	if (!select) {
		return;
	}

	select.innerHTML = '';
	items.forEach((item) => {
		select.append(new Option(item[labelKey], item[valueKey]));
	});
}

/**
 * @description Rebuilds one waveform select from the shared waveform registry using readable labels.
 * @param {HTMLSelectElement|null} select - Waveform select to populate.
 * @returns {void}
 */
function fillWaveSelect(select) {
	if (!select) {
		return;
	}

	select.innerHTML = '';
	ALL_WAVEFORMS.forEach((wave) => {
		select.append(new Option(formatWaveName(wave), wave));
	});
}

/**
 * @description Converts a kebab-case waveform identifier into a readable title.
 * @param {string} wave - Waveform identifier.
 * @returns {string} Human-readable waveform label.
 */
function formatWaveName(wave) {
	return wave
		.replace(/-/g, ' ')
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

/**
 * @description Writes one control value only when the target exists.
 * @param {HTMLElement|null} element - Target form control.
 * @param {string} value - Value to apply.
 * @returns {void}
 */
function setValue(element, value) {
	if (element) {
		element.value = value;
	}
}
