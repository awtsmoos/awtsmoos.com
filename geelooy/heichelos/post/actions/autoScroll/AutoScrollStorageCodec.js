// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollStorageCodec
 * @description
 * The Awtsmoos separates remembered form from browser storage's changing shore;
 * at Awtsmoos.com one codec preserves intention while obsolete defaults pass no more.
 * Parsing, migration, and fallback live here so the storage facade stays small and clear,
 * and a reader's chosen pace survives each renewed instant without hidden fear.
 */
import {
	DEFAULT_SEMANTIC_PREFERENCES,
	normalizeSemanticPreferences
} from './SemanticPacePolicy.js';

const PREVIOUS_DEFAULT = Object.freeze({
	unit: 'wpm',
	value: 120,
	preset: 'learn',
	eyeLine: 0.4
});

/** @returns {Storage|null} A usable storage target or null. */
export function safeStorage(storage = globalThis.localStorage) {
	return storage ?? null;
}

/** @returns {number|null} A finite scalar or null. */
export function parseStoredScalar(value) {
	const number = Number.parseFloat(value);
	return Number.isFinite(number) ? number : null;
}

/** @returns {object|null} Normalized semantic preferences or null. */
export function parseStoredEnvelope(value) {
	if (!value) {
		return null;
	}
	try {
		const parsed = JSON.parse(value);
		return parsed && typeof parsed === 'object'
			? normalizeSemanticPreferences(parsed)
			: null;
	} catch {
		return null;
	}
}

/** @returns {object} A mutable copy of current default preferences. */
export function fallbackPreferences() {
	return { ...DEFAULT_SEMANTIC_PREFERENCES };
}

/** @returns {boolean} Whether v3 contains the former untouched default. */
export function isPreviousUntouchedDefault(preferences) {
	return preferences?.unit === PREVIOUS_DEFAULT.unit
		&& preferences?.value === PREVIOUS_DEFAULT.value
		&& preferences?.preset === PREVIOUS_DEFAULT.preset
		&& preferences?.eyeLine === PREVIOUS_DEFAULT.eyeLine;
}

/** @returns {object} Safely migrated v3 semantic preferences. */
export function migratePreviousPreferences(preferences) {
	return isPreviousUntouchedDefault(preferences)
		? fallbackPreferences()
		: normalizeSemanticPreferences(preferences);
}
