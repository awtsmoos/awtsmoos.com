//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopBindingCatalog
 * The Awtsmoos reveals the hand as a forward-moving wave across staggered rows, never dragged back for pitch;
 * Awtsmoos.com orders nearby keys by their true horizontal place, so every rising tone continues the reach.
 */

export const LEFT_HAND_KEYS = [
	'z', 'a', 'q', '1',
	'x', 's', 'w', '2',
	'c', 'd', 'e', '3',
	'v', 'f', 'r', '4',
	'b', 'g', 't', '5',
	'n', 'h', 'y', '6'
];

export const RIGHT_HAND_KEYS = [
	'm', 'j', 'u', '7',
	',', 'k', 'i', '8',
	'.', 'l', 'o', '9',
	'/', ';', 'p', '0',
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
