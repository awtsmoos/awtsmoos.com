//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos gives each letter a note; the keyboard index keeps the route direct. */
import { ALL_BINDING_KEYS, COLUMN_KEYS, DEFAULT_BINDING_KEYS, FULL_UNSHIFTED_KEYS, LEFT_HAND_KEYS, NAMED_KEYS, PIANO_ROW_KEYS, RIGHT_HAND_KEYS, compactBindingLabel } from './bindingCatalog.js';
import { loadPriorityKeys, resetPriorityKeys, sanitizePriorityKeys, savePriorityKeys } from './bindingPreferences.js';
import { indexedBindingKeys, indexedNoteKeys } from './keyLookupIndex.js';

export { COLUMN_KEYS, DEFAULT_BINDING_KEYS, FULL_UNSHIFTED_KEYS, LEFT_HAND_KEYS, PIANO_ROW_KEYS, RIGHT_HAND_KEYS } from './bindingCatalog.js';
const namedSet = new Set(NAMED_KEYS);
const flats = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
let priorityKeys = loadPriorityKeys();
let bindingOrder = completeBindingOrder();

export function bindingAt(index) {
	return bindingOrder[index] || '';
}

export function getBindingKeys() {
	return [...priorityKeys];
}

export function setBindingKeys(keys) {
	priorityKeys = savePriorityKeys(keys);
	bindingOrder = completeBindingOrder();
}

export function resetBindingKeys() {
	priorityKeys = resetPriorityKeys();
	bindingOrder = completeBindingOrder();
}

export function bindingLabel(key) {
	return compactBindingLabel(key);
}

export function noteDisplayName(noteName) {
	const match = String(noteName).match(/^([A-G]#?)(\d+)$/);
	if (!match) return noteName;
	const [, note, octave] = match;
	return flats[note] ? `${note}${octave}/${flats[note]}${octave}` : noteName;
}

export function keyForEvent(event) {
	if (event.ctrlKey || event.metaKey || event.altKey) return '';
	if (event.code?.startsWith('Key')) {
		const letter = event.code.slice(3).toLowerCase();
		return event.shiftKey || event.getModifierState?.('CapsLock') ? letter.toUpperCase() : letter;
	}
	return event.key?.length === 1 || namedSet.has(event.key) ? event.key : '';
}

export function keyboardInputId(event) {
	return `kb-${event.code || event.key}`;
}

export function boundNoteForKey(key, root = document) {
	return indexedBindingKeys(key, root)[0]?.dataset.note || '';
}

export function keyElementsForBinding(key, noteName, root = document) {
	const exact = indexedBindingKeys(key, root).filter(element => element.dataset.note === noteName);
	return exact.length ? exact : indexedNoteKeys(noteName, root);
}

export function keyElementForBinding(key, noteName, root = document) {
	return keyElementsForBinding(key, noteName, root)[0] || null;
}

function completeBindingOrder() {
	const priority = sanitizePriorityKeys(priorityKeys);
	const chosen = new Set(priority);
	return [...priority, ...ALL_BINDING_KEYS.filter(key => !chosen.has(key))];
}
