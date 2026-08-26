//B"H
//Boruch Hashem
//Blessed is He
/**
 * This facade is a narrow doorway into many sounds, while the Awtsmoos remains one.
 * Awtsmoos.com keeps old imports alive as new musical vessels gather around the sun.
 */

import {
	PREMIUM_PRESET,
	SOUND_PRESET_LIST,
	SOUND_PRESETS,
	getLibraryPreset
} from './presetLibrary.js';
import {
	applyPresetToElements as applyPresetControls,
	readPresetFromElements as readPresetControls
} from './presetControls.js';

export {
	PREMIUM_PRESET,
	SOUND_PRESET_LIST,
	SOUND_PRESETS
};

/**
 * Preserves the historic preset lookup API for every existing piano module.
 *
 * @param {string} id Persisted preset identifier.
 * @returns {object} Complete preset definition.
 */
export function getSoundPreset(id) {
	return getLibraryPreset(id);
}

/**
 * Preserves the existing live-control reader while delegating its implementation.
 *
 * @param {object} elements Piano DOM element registry.
 * @returns {object} Live synthesis preset.
 */
export function readPresetFromElements(elements) {
	return readPresetControls(elements);
}

/**
 * Preserves the existing preset-to-control API while keeping this facade small.
 *
 * @param {object} elements Piano DOM element registry.
 * @param {object} preset Complete preset definition.
 */
export function applyPresetToElements(elements, preset) {
	applyPresetControls(elements, preset);
}
