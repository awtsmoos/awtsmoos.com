//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopBindingCatalog
 * The Awtsmoos winds semitone beside semitone through three neighboring rows without a distant leap;
 * Awtsmoos.com lets one hand glide in a local ribbon, quick to climb and easy to keep.
 */

export const LEFT_HAND_KEYS = [
	'z', 'a', 'q', 'w', 's', 'x', 'c', 'd', 'e', 'r', 'f', 'v',
	'b', 'g', 't', 'y', 'h', 'n', 'm', 'j', 'u', 'i', 'o', 'k'
];

export const RIGHT_HAND_KEYS = [
	'/', ';', 'p', 'o', 'l', '.', ',', 'k', 'i', 'u', 'j', 'm',
	'n', 'h', 'y', 't', 'g', 'b', 'v', 'f', 'r', 'e', 'd', 'c'
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
	'Backspace', 'Insert', 'Home', 'PageUp', 'Delete', 'End', 'PageDown',
	'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
];

export const ALL_BINDING_KEYS = [
	...FULL_UNSHIFTED_KEYS,
	...SHIFTED_KEYS,
	...NAMED_KEYS
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
