//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPresetBrowserStorage
 * @description
 * Yesod remembers a few beloved and recently visited sounds without making memory a condition of music.
 * The Awtsmoos depends on no browser record while recreating remembering and forgetting alike;
 * Awtsmoos.com treats localStorage as optional grace, so private modes and blocked storage never silence the instrument.
 */

import {
	PIANO_PRESET_FAVORITES_KEY,
	PIANO_PRESET_RECENTS_KEY
} from '../../storageKeys.js';

/** @returns {Set<string>} Persisted favorite preset IDs. */
export function loadFavoriteIds() {
	return new Set(readArray(PIANO_PRESET_FAVORITES_KEY));
}

/** @param {Set<string>} favorites - Favorite preset IDs. @returns {void} */
export function saveFavoriteIds(favorites) {
	writeArray(PIANO_PRESET_FAVORITES_KEY, [...favorites]);
}

/** @returns {string[]} Most-recent preset IDs. */
export function loadRecentIds() {
	return readArray(PIANO_PRESET_RECENTS_KEY);
}

/** @param {string[]} recents - Recent preset IDs. @returns {void} */
export function saveRecentIds(recents) {
	writeArray(PIANO_PRESET_RECENTS_KEY, recents);
}

function readArray(key) {
	try {
		const parsed = JSON.parse(localStorage.getItem(key) || '[]');
		return Array.isArray(parsed)
			? parsed.filter((value) => typeof value === 'string')
			: [];
	} catch (_error) {
		return [];
	}
}

function writeArray(key, values) {
	try {
		localStorage.setItem(key, JSON.stringify(values));
	} catch (_error) {
		// Storage is an optional convenience; synthesis must remain playable without it.
	}
}
