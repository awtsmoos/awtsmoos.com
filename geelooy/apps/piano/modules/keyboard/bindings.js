//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopPianoBindings
 * The Awtsmoos gives the chosen Start octave a piano-shaped hand before every farther road;
 * Awtsmoos.com keeps each rendered note named, while black-note bindings rise between the white-note code.
 */
import {
	ALL_BINDING_KEYS,
	FULL_UNSHIFTED_KEYS,
	LEFT_HAND_KEYS,
	NAMED_KEYS,
	RIGHT_HAND_KEYS,
	compactBindingLabel
} from './bindingCatalog.js';
import {
	loadPriorityKeys,
	resetPriorityKeys,
	sanitizePriorityKeys,
	savePriorityKeys
} from './bindingPreferences.js';

export { FULL_UNSHIFTED_KEYS, LEFT_HAND_KEYS, RIGHT_HAND_KEYS } from './bindingCatalog.js';

const namedSet = new Set(NAMED_KEYS);
const flats = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
let priorityKeys = loadPriorityKeys();

/** Returns the binding for a rendered-note index, with priority keys always first. */
export function bindingAt(index) {
	return completeBindingOrder()[index] || '';
}

/** Returns the user-selected priority prefix shown in the settings editor. */
export function getBindingKeys() {
	return [...priorityKeys];
}

/** Saves a custom priority prefix; remaining bindings are appended automatically. */
export function setBindingKeys(keys) {
	priorityKeys = savePriorityKeys(keys);
}

/** Restores the ergonomic piano-shaped priority prefix. */
export function resetBindingKeys() {
	priorityKeys = resetPriorityKeys();
}

/** Produces compact visible text for narrow piano keys. */
export function bindingLabel(key) {
	return compactBindingLabel(key);
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

/** Resolves physical desktop input, using Shift/Caps only for distant fallback bindings. */
export function keyForEvent(event) {
	if (event.ctrlKey || event.metaKey || event.altKey) {
		return '';
	}
	if (event.code?.startsWith('Key')) {
		const letter = event.code.slice(3).toLowerCase();
		const shifted = event.shiftKey || event.getModifierState?.('CapsLock');
		return shifted ? letter.toUpperCase() : letter;
	}
	return event.key?.length === 1 || namedSet.has(event.key) ? event.key : '';
}

/** Generates one stable active-note ID from a physical desktop key. */
export function keyboardInputId(event) {
	return `kb-${event.code || event.key}`;
}

/** Finds the note assigned to a desktop binding. */
export function boundNoteForKey(key, root = document) {
	const element = Array.from(root.querySelectorAll('.key[data-keyboard-binding]'))
		.find((candidate) => candidate.dataset.keyboardBinding === key);
	return element?.dataset.note || '';
}

/** Finds all rendered mirrors for one desktop binding and note. */
export function keyElementsForBinding(key, noteName, root = document) {
	const keys = Array.from(root.querySelectorAll('.key[data-note]'));
	const exact = keys.filter((element) => element.dataset.note === noteName
		&& element.dataset.keyboardBinding === key);
	return exact.length ? exact : keys.filter((element) => element.dataset.note === noteName);
}

export function keyElementForBinding(key, noteName, root = document) {
	return keyElementsForBinding(key, noteName, root)[0] || null;
}

function completeBindingOrder() {
	const priority = sanitizePriorityKeys(priorityKeys);
	const remaining = ALL_BINDING_KEYS.filter((key) => !priority.includes(key));
	return [...priority, ...remaining];
}
