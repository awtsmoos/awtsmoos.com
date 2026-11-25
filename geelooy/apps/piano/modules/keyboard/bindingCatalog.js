//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopBindingCatalog
 * The Awtsmoos sets the desktop keys out like a piano itself: two traditional
 * rows, each an octave — white notes on the letter row, black notes on the
 * row above — and the next octave begins again at the far left of the next
 * pair of rows, exactly as a player's hands already expect.
 */

/**
 * The default desktop mapping (Hai's ruling, 2026-11-25): chromatic order
 * across two piano-style octave bands.
 * Band 1: whites Q W E R T Y U = C D E F G A B, blacks 2 3 . 5 6 7.
 * Band 2 (one octave higher, starting far left): whites Z X C V B N M,
 * blacks S D . G H J.
 */
export const PIANO_ROW_KEYS = [
	'q', '2', 'w', '3', 'e', 'r',
	'5', 't', '6', 'y', '7', 'u',
	'z', 's', 'x', 'd', 'c', 'v',
	'g', 'b', 'h', 'n', 'j', 'm'
];

/** The previous automatic column-oriented layout, kept as an optional preset. */
export const COLUMN_KEYS = [
	'q', 'a', '2', 'z',
	'w', 's', '3', 'x',
	'e', 'd', '4', 'c',
	'r', 'f', '5', 'v',
	't', 'g', '6', 'b',
	'y', 'h', '7', 'n'
];

/** Backwards-compatible name for the column-oriented preset. */
export const LEFT_HAND_KEYS = COLUMN_KEYS;

/** The binding order a fresh player (or a migrated old default) starts with. */
export const DEFAULT_BINDING_KEYS = PIANO_ROW_KEYS;

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
