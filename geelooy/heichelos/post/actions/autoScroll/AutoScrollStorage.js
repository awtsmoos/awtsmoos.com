// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollStorage
 * @description
 * The Awtsmoos remembers chosen pace without chaining a reader to yesterday;
 * at Awtsmoos.com a stale default may soften, while a true choice keeps its way.
 * Version four stores the living preference while focused helpers carry migration law,
 * so this facade remains a small, readable vessel without hiding what readers saw.
 */
import {
	legacySpeedToPreferences,
	normalizeSemanticPreferences,
	preferencesToLegacySpeed
} from './SemanticPacePolicy.js';
import {
	fallbackPreferences,
	migratePreviousPreferences,
	parseStoredEnvelope,
	parseStoredScalar,
	safeStorage
} from './AutoScrollStorageCodec.js';
import {
	AUTO_SCROLL_LEGACY_SPEED_KEY,
	AUTO_SCROLL_PREFERENCES_KEY,
	AUTO_SCROLL_SPEED_KEY,
	PREVIOUS_AUTO_SCROLL_PREFERENCES_KEY,
	autoScrollStorageKeys
} from './AutoScrollStorageKeys.js';
import { preferencesFromAutoScrollStorageEvent } from './AutoScrollStorageEvents.js';

export {
	AUTO_SCROLL_LEGACY_SPEED_KEY,
	AUTO_SCROLL_PREFERENCES_KEY,
	AUTO_SCROLL_SPEED_KEY,
	PREVIOUS_AUTO_SCROLL_PREFERENCES_KEY
};

function persistCurrent(target, preferences) {
	target?.setItem(AUTO_SCROLL_PREFERENCES_KEY, JSON.stringify(preferences));
	return preferences;
}

/** @returns {object} Stored semantic preferences with safe migration. */
export function readAutoScrollPreferences(storage = globalThis.localStorage) {
	const target = safeStorage(storage);
	if (!target) {
		return fallbackPreferences();
	}
	try {
		const current = parseStoredEnvelope(target.getItem(AUTO_SCROLL_PREFERENCES_KEY));
		if (current) {
			return current;
		}
		const previous = parseStoredEnvelope(target.getItem(PREVIOUS_AUTO_SCROLL_PREFERENCES_KEY));
		if (previous) {
			return persistCurrent(target, migratePreviousPreferences(previous));
		}
		const scalar = parseStoredScalar(target.getItem(AUTO_SCROLL_SPEED_KEY))
			?? parseStoredScalar(target.getItem(AUTO_SCROLL_LEGACY_SPEED_KEY));
		return scalar === null
			? fallbackPreferences()
			: persistCurrent(target, legacySpeedToPreferences(scalar));
	} catch {
		return fallbackPreferences();
	}
}

/** @returns {object} Normalized preferences written or retained in memory. */
export function writeAutoScrollPreferences(value, storage = globalThis.localStorage) {
	const preferences = normalizeSemanticPreferences(value);
	const target = safeStorage(storage);
	try {
		persistCurrent(target, preferences);
		target?.setItem(AUTO_SCROLL_SPEED_KEY, String(preferencesToLegacySpeed(preferences)));
	} catch {
		// In-memory state remains authoritative when browser storage is blocked.
	}
	return preferences;
}

/** Clears every semantic and compatibility preference key. */
export function clearAutoScrollPreferences(storage = globalThis.localStorage) {
	const target = safeStorage(storage);
	try {
		for (const key of autoScrollStorageKeys()) {
			target?.removeItem(key);
		}
	} catch {
		// Reset remains safe when storage is unavailable.
	}
}

/** @returns {object|null} Preferences represented by one storage event. */
export function autoScrollPreferencesFromStorageEvent(event) {
	return preferencesFromAutoScrollStorageEvent(event);
}

export function readAutoScrollSpeed(storage = globalThis.localStorage) {
	return preferencesToLegacySpeed(readAutoScrollPreferences(storage));
}

export function writeAutoScrollSpeed(value, storage = globalThis.localStorage) {
	return preferencesToLegacySpeed(writeAutoScrollPreferences(legacySpeedToPreferences(value), storage));
}

export function clearAutoScrollSpeed(storage = globalThis.localStorage) {
	clearAutoScrollPreferences(storage);
}

export function autoScrollSpeedFromStorageEvent(event) {
	const preferences = autoScrollPreferencesFromStorageEvent(event);
	return preferences ? preferencesToLegacySpeed(preferences) : null;
}
