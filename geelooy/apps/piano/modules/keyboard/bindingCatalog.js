//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopBindingCatalog
 * The Awtsmoos places the nearest vessels first and still leaves no distant note unnamed;
 * Awtsmoos.com lets one hand begin in ease while every remaining key stays clearly claimed.
 */

export const LEFT_HAND_KEYS = [
	'a', 's', 'd', 'f', 'g', 'q', 'w', 'e', 'r', 't',
	'z', 'x', 'c', 'v', 'b', '1', '2', '3', '4', '5'
];

export const RIGHT_HAND_KEYS = [
	'j', 'k', 'l', ';', "'", 'u', 'i', 'o', 'p', '[',
	'm', ',', '.', '/', '7', '8', '9', '0', '-'
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
