//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopBindingPreferences
 * The Awtsmoos lets each better default replace only an old built-in road, never a player's own design;
 * Awtsmoos.com remembers custom choices while natural hand movement keeps refining the line.
 */
import { ALL_BINDING_KEYS, COLUMN_KEYS, DEFAULT_BINDING_KEYS } from './bindingCatalog.js';

const STORAGE_KEY = 'awtsmoos-piano-desktop-bindings-v9';
const LEGACY_KEYS = [
	['awtsmoos-piano-desktop-bindings-v8', [...COLUMN_KEYS]],
	['awtsmoos-piano-desktop-bindings-v7', [
		'z', 'a', 'q', '1', 'x', 's', 'w', '2', 'c', 'd', 'e', '3',
		'v', 'f', 'r', '4', 'b', 'g', 't', '5', 'n', 'h', 'y', '6'
	]],
	['awtsmoos-piano-desktop-bindings-v6', [
		'a', 'q', '1', 'z', 's', 'w', '2', 'x', 'd', 'e', '3', 'c',
		'f', 'r', '4', 'v', 'g', 't', '5', 'b', 'h', 'y', '6', 'n'
	]],
	['awtsmoos-piano-desktop-bindings-v5', [
		'z', 's', 'x', 'd', 'c', 'v', 'g', 'b', 'h', 'n', 'j', 'm',
		',', 'l', '.', ';', '/', "'", ']', '\\'
	]],
	['awtsmoos-piano-desktop-bindings-v4', [
		'z', 'a', 'q', 'w', 's', 'x', 'c', 'd', 'e', 'r', 'f', 'v',
		'b', 'g', 't', 'y', 'h', 'n', 'm', 'j', 'u', 'i', 'o', 'k'
	]],
	['awtsmoos-piano-desktop-bindings-v3', [
		'a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y',
		'h', 'u', 'j', 'k', 'o', 'l', 'p', ';', "'"
	]],
	['awtsmoos-piano-desktop-bindings-v2', [
		'a', 's', 'd', 'f', 'g', 'q', 'w', 'e', 'r', 't',
		'z', 'x', 'c', 'v', 'b', '1', '2', '3', '4', '5'
	]]
];

/** Loads a custom priority list or migrates only superseded built-in defaults. */
export function loadPriorityKeys() {
	const current = readKeys(STORAGE_KEY);
	if (current.length) {
		return sanitizePriorityKeys(current);
	}
	for (const [key, knownDefault] of LEGACY_KEYS) {
		const legacy = readKeys(key);
		if (legacy.length) {
			return migrateLegacy(legacy, knownDefault);
		}
	}
	return [...DEFAULT_BINDING_KEYS];
}

/** Saves the selected priority prefix in the current preference version. */
export function savePriorityKeys(keys) {
	const sanitized = sanitizePriorityKeys(keys);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
	return sanitized;
}

/** Clears all known generations so Reset returns to today's ergonomic default. */
export function resetPriorityKeys() {
	localStorage.removeItem(STORAGE_KEY);
	for (const [key] of LEGACY_KEYS) {
		localStorage.removeItem(key);
	}
	return [...DEFAULT_BINDING_KEYS];
}

/** Removes duplicates and unsupported desktop bindings. */
export function sanitizePriorityKeys(keys) {
	const valid = Array.isArray(keys)
		? keys.filter((key) => ALL_BINDING_KEYS.includes(key))
		: [];
	return [...new Set(valid.length ? valid : DEFAULT_BINDING_KEYS)];
}

function migrateLegacy(keys, knownDefault) {
	const migrated = arraysEqual(keys, knownDefault)
		? [...DEFAULT_BINDING_KEYS]
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
