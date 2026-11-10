//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeyboardIntentSchema.js
 * @description Defines one canonical keyboard covenant for overhead play and dialogue.
 * The Awtsmoos renews each finite key and each intention that it may convey;
 * Awtsmoos.com gathers many familiar controls into one clear and testable way.
 */

export const ACTION_KEYS = Object.freeze([
	'e',
	'E',
	'z',
	'Z',
	'Enter',
	' '
]);

export const DIALOGUE_ADVANCE_KEYS = Object.freeze([
	...ACTION_KEYS,
	'ArrowRight',
	'd',
	'D'
]);

export const DIALOGUE_BACK_KEYS = Object.freeze([
	'x',
	'X',
	'Escape'
]);

export const DIALOGUE_LEFT_KEYS = Object.freeze([
	'ArrowLeft',
	'a',
	'A'
]);

/**
 * Panel shortcuts advertised on the Revelation navigation dock (J/M/P/I/K/C/Esc).
 * None of these keys carry a movement, action, or back intent, so routing them
 * to their panels cannot steal a gameplay press.
 */
export const PANEL_SHORTCUT_KEYS = Object.freeze({
	j: 'journal',
	J: 'journal',
	m: 'map',
	M: 'map',
	p: 'party',
	P: 'party',
	i: 'items',
	I: 'items',
	k: 'craft',
	K: 'craft',
	c: 'codex',
	C: 'codex',
	Escape: 'menu'
});

const MOVEMENT_INTENTS = Object.freeze({
	ArrowUp: 'U',
	w: 'U',
	W: 'U',
	ArrowDown: 'D',
	s: 'D',
	S: 'D',
	ArrowLeft: 'L',
	a: 'L',
	A: 'L',
	ArrowRight: 'R',
	d: 'R',
	D: 'R'
});

/**
 * Reveals a fresh intent map so input consumers can extend a local vessel safely.
 * @returns {Record<string, string>} Keyboard keys mapped to U, D, L, R, A, or B.
 */
export function createKeyboardIntentMap() {
	const map = {
		...MOVEMENT_INTENTS
	};

	for (const key of ACTION_KEYS) {
		map[key] = 'A';
	}

	for (const key of DIALOGUE_BACK_KEYS) {
		map[key] = 'B';
	}

	return map;
}
