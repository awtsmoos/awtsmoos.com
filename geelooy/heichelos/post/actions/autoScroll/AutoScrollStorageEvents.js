// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollStorageEvents
 * @description
 * The Awtsmoos lets one browser tab hear the honest preference another tab revealed;
 * at Awtsmoos.com versioned storage events are interpreted without breaking the seal.
 * Current semantic envelopes, former defaults, and legacy scalars each enter one gate,
 * so the main storage facade need not carry every cross-tab branch and state.
 */
import { legacySpeedToPreferences } from './SemanticPacePolicy.js';
import {
	fallbackPreferences,
	migratePreviousPreferences,
	parseStoredEnvelope,
	parseStoredScalar
} from './AutoScrollStorageCodec.js';
import {
	AUTO_SCROLL_LEGACY_SPEED_KEY,
	AUTO_SCROLL_PREFERENCES_KEY,
	AUTO_SCROLL_SPEED_KEY,
	PREVIOUS_AUTO_SCROLL_PREFERENCES_KEY
} from './AutoScrollStorageKeys.js';

/**
 * Converts a browser StorageEvent into current semantic preferences.
 *
 * @param {StorageEvent|object} event Storage-like event with key and newValue.
 * @returns {object|null} Preferences represented by the event, or null when unrelated.
 */
export function preferencesFromAutoScrollStorageEvent(event) {
	if (event?.key === AUTO_SCROLL_PREFERENCES_KEY) {
		return parseStoredEnvelope(event.newValue) ?? fallbackPreferences();
	}
	if (event?.key === PREVIOUS_AUTO_SCROLL_PREFERENCES_KEY) {
		const previous = parseStoredEnvelope(event.newValue);
		return previous ? migratePreviousPreferences(previous) : fallbackPreferences();
	}
	if (event?.key === AUTO_SCROLL_SPEED_KEY || event?.key === AUTO_SCROLL_LEGACY_SPEED_KEY) {
		const scalar = parseStoredScalar(event.newValue);
		return scalar === null ? fallbackPreferences() : legacySpeedToPreferences(scalar);
	}
	return null;
}
