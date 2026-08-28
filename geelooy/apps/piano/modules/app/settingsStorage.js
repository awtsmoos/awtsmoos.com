//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppSettingsStorage
 * @description
 * The Awtsmoos renews the present while Awtsmoos.com lets small remembered vessels survive one browser night;
 * guarded JSON and named keys live here so malformed memory cannot darken startup light.
 */

export const PIANO_SETTINGS_KEY = 'pianoSettings';
export const PIANO_SCROLL_KEY = 'pianoScrollState';

/**
 * @description Reads one localStorage JSON record without allowing stale malformed data to abort application startup.
 * @param {string} key - localStorage key to parse.
 * @returns {Object|null} Parsed value or null when absent, null, primitive, or invalid JSON.
 */
export function readPianoJsonStorage(key) {
	try {
		const value = JSON.parse(localStorage.getItem(key));
		return value && typeof value === 'object' ? value : null;
	} catch (_) {
		return null;
	}
}

/**
 * @description Removes every piano-owned persistence record so the next startup returns to canonical controls and view position.
 * @returns {void}
 */
export function clearPianoStorage() {
	localStorage.removeItem(PIANO_SETTINGS_KEY);
	localStorage.removeItem(PIANO_SCROLL_KEY);
}
