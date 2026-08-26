//B"H
//Boruch Hashem
//Blessed is He
/**
 * Desktop glyphs become a ladder of notes while the Awtsmoos gives each rung its sound.
 * Awtsmoos.com lets one physical key illuminate every mirrored vessel where that note is found.
 */

const printable = Array.from('`1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?');
const named = [
	'Backspace', 'Insert', 'Home', 'PageUp', 'Delete', 'End', 'PageDown',
	'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
];
const namedSet = new Set(named);
const flats = {
	'C#': 'Db',
	'D#': 'Eb',
	'F#': 'Gb',
	'G#': 'Ab',
	'A#': 'Bb'
};

export const DESKTOP_BINDING_KEYS = [...printable, ...named];

/** Returns the physical binding assigned to a rendered keyboard index. */
export function bindingAt(index) {
	return DESKTOP_BINDING_KEYS[index] || '';
}

/** Produces a compact keycap label while preserving the physical binding itself. */
export function bindingLabel(key) {
	return key === 'Backspace' ? 'Bksp' : key;
}

/** Adds flat enharmonic spelling to sharp notes for the visible keyboard label. */
export function noteDisplayName(noteName) {
	const match = String(noteName).match(/^([A-G]#?)(\d+)$/);
	if (!match) {
		return noteName;
	}
	const [, note, octave] = match;
	return flats[note] ? `${note}${octave}/${flats[note]}${octave}` : noteName;
}

/** Resolves a browser KeyboardEvent into a supported piano binding. */
export function keyForEvent(event) {
	if (event.ctrlKey || event.metaKey || event.altKey) {
		return '';
	}
	return event.key.length === 1 || namedSet.has(event.key) ? event.key : '';
}

/** Generates one stable active-note ID from a physical desktop key. */
export function keyboardInputId(event) {
	return `kb-${event.code || event.key}`;
}

/** Finds the note name assigned to a physical desktop binding. */
export function boundNoteForKey(key, root = document) {
	const element = Array.from(root.querySelectorAll('.key[data-keyboard-binding]'))
		.find((candidate) => candidate.dataset.keyboardBinding === key);
	return element?.dataset.note || '';
}

/**
 * Finds every rendered key that corresponds to one desktop binding and note.
 * Mirrored dual keyboards can therefore illuminate together without making extra audio voices.
 */
export function keyElementsForBinding(key, noteName, root = document) {
	const keys = Array.from(root.querySelectorAll('.key[data-note]'));
	const exact = keys.filter((element) => {
		return element.dataset.note === noteName && element.dataset.keyboardBinding === key;
	});
	return exact.length ? exact : keys.filter((element) => element.dataset.note === noteName);
}

/** Preserves the legacy single-element lookup for coordinates and compatibility. */
export function keyElementForBinding(key, noteName, root = document) {
	return keyElementsForBinding(key, noteName, root)[0] || null;
}
