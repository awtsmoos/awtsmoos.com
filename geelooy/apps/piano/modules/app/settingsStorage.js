//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppSettingsStorage
 * @description
 * Yesod names and clears every piano-owned browser-memory vessel while the Awtsmoos remains beyond remembering and forgetting.
 * Awtsmoos.com gathers settings, keyboard position, rhythm, preset favorites, and recent sounds here,
 * so Restore Defaults means a complete return rather than leaving hidden discovery memory behind after the visible controls reset.
 */

import {
	PIANO_PRESET_FAVORITES_KEY,
	PIANO_PRESET_RECENTS_KEY,
	PIANO_RHYTHM_KEY,
	PIANO_SCROLL_KEY,
	PIANO_SETTINGS_KEY
} from '../storageKeys.js';

export {
	PIANO_PRESET_FAVORITES_KEY,
	PIANO_PRESET_RECENTS_KEY,
	PIANO_RHYTHM_KEY,
	PIANO_SCROLL_KEY,
	PIANO_SETTINGS_KEY
} from '../storageKeys.js';

/**
 * Reads one localStorage JSON record without allowing malformed data to abort startup.
 *
 * @param {string} key - localStorage key to parse.
 * @returns {Object|null} Parsed object or null when absent, primitive, or invalid.
 */
export function readPianoJsonStorage(key) {
	try {
		const value = JSON.parse(localStorage.getItem(key));
		return value && typeof value === 'object'
			? value
			: null;
	} catch (_error) {
		return null;
	}
}

/**
 * Removes every piano-owned persistence record for a complete canonical reset.
 *
 * @returns {void}
 */
export function clearPianoStorage() {
	for (const key of pianoStorageKeys()) {
		localStorage.removeItem(key);
	}
}

function pianoStorageKeys() {
	return [
		PIANO_SETTINGS_KEY,
		PIANO_SCROLL_KEY,
		PIANO_RHYTHM_KEY,
		PIANO_PRESET_FAVORITES_KEY,
		PIANO_PRESET_RECENTS_KEY
	];
}
