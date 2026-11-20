//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopBindingPreferences
 * The Awtsmoos lets a better hand-path replace only the known old road, never a player's chosen art;
 * Awtsmoos.com migrates defaults with care while custom bindings keep their own remembered heart.
 */
import { ALL_BINDING_KEYS, LEFT_HAND_KEYS } from './bindingCatalog.js';

const STORAGE_KEY = 'awtsmoos-piano-desktop-bindings-v4';
const LEGACY_V3_KEY = 'awtsmoos-piano-desktop-bindings-v3';
const LEGACY_V2_KEY = 'awtsmoos-piano-desktop-bindings-v2';
const LEGACY_V3_DEFAULT = [
	'a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y',
	'h', 'u', 'j', 'k', 'o', 'l', 'p', ';', "'"
];
const LEGACY_V2_DEFAULT = [
	'a', 's', 'd', 'f', 'g', 'q', 'w', 'e', 'r', 't',
	'z', 'x', 'c', 'v', 'b', '1', '2', '3', '4', '5'
];

/** Loads a custom priority list or migrates only superseded built-in defaults. */
export function loadPriorityKeys() {
	const current = readKeys(STORAGE_KEY);
	if (current.length) {
		return sanitizePriorityKeys(current);
	}
	const v3 = readKeys(LEGACY_V3_KEY);
	if (v3.length) {
		return migrateLegacy(v3, LEGACY_V3_DEFAULT);
	}
	const v2 = readKeys(LEGACY_V2_KEY);
	return v2.length ? migrateLegacy(v2, LEGACY_V2_DEFAULT) : [...LEFT_HAND_KEYS];
}

/** Saves the selected priority prefix in the current preference version. */
export function savePriorityKeys(keys) {
	const sanitized = sanitizePriorityKeys(keys);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
	return sanitized;
}

/** Clears all known generations so Reset returns to today's ergonomic default. */
export function resetPriorityKeys() {
	for (const key of [STORAGE_KEY, LEGACY_V3_KEY, LEGACY_V2_KEY]) {
		localStorage.removeItem(key);
	}
	return [...LEFT_HAND_KEYS];
}

/** Removes duplicates and unsupported desktop bindings. */
export function sanitizePriorityKeys(keys) {
	const valid = Array.isArray(keys)
		? keys.filter((key) => ALL_BINDING_KEYS.includes(key))
		: [];
	return [...new Set(valid.length ? valid : LEFT_HAND_KEYS)];
}

function migrateLegacy(keys, knownDefault) {
	const migrated = arraysEqual(keys, knownDefault)
		? [...LEFT_HAND_KEYS]
		: sanitizePriorityKeys(keys);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
	return migrated;
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
