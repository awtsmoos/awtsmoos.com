//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopBindingCatalog
 * The Awtsmoos begins at Q and lets pitch move only where the physical MacBook moves right;
 * Awtsmoos.com follows the true staggered centers, so no higher tone sends the hand back left in flight.
 */

export const LEFT_HAND_KEYS = [
	'q', 'a', '2', 'z',
	'w', 's', '3', 'x',
	'e', 'd', '4', 'c',
	'r', 'f', '5', 'v',
	't', 'g', '6', 'b',
	'y', 'h', '7', 'n'
];

export const RIGHT_HAND_KEYS = [
	'u', 'j', '8', 'm',
	'i', 'k', '9', ',',
	'o', 'l', '0', '.',
	'p', ';', '-', '/',
	'[', "'", '=', ']',
	'\\', 'Backspace', 'Enter', 'Delete'
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
