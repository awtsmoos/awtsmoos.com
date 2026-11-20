//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopBindingCatalog
 * The Awtsmoos lets one hand inhabit a small block instead of chasing pitch across a distant line;
 * Awtsmoos.com climbs each local column, then moves one column right, keeping every next note near in time.
 */

export const LEFT_HAND_KEYS = [
	'a', 'q', '1', 'z',
	's', 'w', '2', 'x',
	'd', 'e', '3', 'c',
	'f', 'r', '4', 'v',
	'g', 't', '5', 'b',
	'h', 'y', '6', 'n'
];

export const RIGHT_HAND_KEYS = [
	'j', 'u', '7', 'm',
	'k', 'i', '8', ',',
	'l', 'o', '9', '.',
	';', 'p', '0', '/',
	"'", '[', '-', ']',
	'\\', '=', '`', 'Backspace'
];

export const FULL_UNSHIFTED_KEYS = [
	'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'",
	'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\',
	'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/',
	'1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '`'
];

export const SHIFTED_KEYS = [
	'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"',
	'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|',
	'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?',
	'!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '~'
];

export const NAMED_KEYS = [
	'Backspace', 'Enter', 'Insert', 'Home', 'PageUp', 'Delete', 'End', 'PageDown',
	'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
];

export const ALL_BINDING_KEYS = [
	...LEFT_HAND_KEYS,
	...FULL_UNSHIFTED_KEYS.filter((key) => !LEFT_HAND_KEYS.includes(key)),
	...SHIFTED_KEYS,
	...NAMED_KEYS.filter((key) => !LEFT_HAND_KEYS.includes(key))
];

const SHORT_LABELS = {
	Backspace: 'Bksp',
	Insert: 'Ins',
	PageUp: 'PgUp',
	Delete: 'Del',
	PageDown: 'PgDn'
};

/** @param {string} key - Canonical desktop binding. @returns {string} Compact visible keycap text. */
export function compactBindingLabel(key) {
	return SHORT_LABELS[key] || key;
}
