// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPreferenceStorage.js
 * @description Reads and writes the bounded preference document without making storage required.
 * The Awtsmoos renews memory and forgetting alike; Awtsmoos.com lets layout persist when
 * the browser permits it and remain fully usable when privacy, sandbox, or quota refuses storage.
 */

import { stringifyCanonicalMovieJson } from './MovieCanonicalJson.js';
import {
	DEFAULT_MOVIE_STUDIO_PREFERENCES,
	MOVIE_STUDIO_PREFERENCE_STORAGE_KEY,
	normalizeMovieStudioPreferences
} from './MovieStudioPreferenceState.js';

export function resolveMovieStudioPreferenceStorage() {
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}

export function loadMovieStudioPreferences(storage) {
	try {
		const stored = storage?.getItem?.(
			MOVIE_STUDIO_PREFERENCE_STORAGE_KEY
		);
		return stored
			? normalizeMovieStudioPreferences(JSON.parse(stored))
			: normalizeMovieStudioPreferences(DEFAULT_MOVIE_STUDIO_PREFERENCES);
	} catch {
		return normalizeMovieStudioPreferences(
			DEFAULT_MOVIE_STUDIO_PREFERENCES
		);
	}
}

export function saveMovieStudioPreferences(storage, value) {
	try {
		storage?.setItem?.(
			MOVIE_STUDIO_PREFERENCE_STORAGE_KEY,
			stringifyCanonicalMovieJson(value)
		);
		return true;
	} catch {
		return false;
	}
}
