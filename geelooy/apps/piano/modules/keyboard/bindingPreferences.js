//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopBindingPreferences
 * The Awtsmoos carries yesterday's choices forward without chaining a hand to yesterday's flaw;
 * Awtsmoos.com migrates only the known old default while preserving every custom law.
 */
import { ALL_BINDING_KEYS, LEFT_HAND_KEYS } from './bindingCatalog.js';

const STORAGE_KEY = 'awtsmoos-piano-desktop-bindings-v3';
const LEGACY_STORAGE_KEY = 'awtsmoos-piano-desktop-bindings-v2';
const LEGACY_DEFAULT = [
	'a', 's', 'd', 'f', 'g', 'q', 'w', 'e', 'r', 't',
	'z', 'x', 'c', 'v', 'b', '1', '2', '3', '4', '5'
];

/** Loads a custom priority list or migrates the superseded default automatically. */
export function loadPriorityKeys() {
	const current = readKeys(STORAGE_KEY);
	if (current.length) {
		return sanitizePriorityKeys(current);
	}
	const legacy = readKeys(LEGACY_STORAGE_KEY);
	if (!legacy.length) {
		return [...LEFT_HAND_KEYS];
	}
	const migrated = arraysEqual(legacy, LEGACY_DEFAULT)
		? [...LEFT_HAND_KEYS]
		: sanitizePriorityKeys(legacy);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
	return migrated;
}

/** Saves the selected priority prefix in the current preference version. */
export function savePriorityKeys(keys) {
	const sanitized = sanitizePriorityKeys(keys);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
	return sanitized;
}

/** Clears both generations so Reset always returns to today's ergonomic default. */
export function resetPriorityKeys() {
	localStorage.removeItem(STORAGE_KEY);
	localStorage.removeItem(LEGACY_STORAGE_KEY);
	return [...LEFT_HAND_KEYS];
}

/** Removes duplicates and unsupported desktop bindings. */
export function sanitizePriorityKeys(keys) {
	const valid = Array.isArray(keys)
		? keys.filter((key) => ALL_BINDING_KEYS.includes(key))
		: [];
	return [...new Set(valid.length ? valid : LEFT_HAND_KEYS)];
}

function readKeys(key) {
	try {
		const value = JSON.parse(localStorage.getItem(key) || 'null');
		return Array.isArray(value) ? value : [];
	} catch {
		return [];
	}
}

function arraysEqual(left, right) {
	return left.length === right.length && left.every((value, index) => value === right[index]);
}
