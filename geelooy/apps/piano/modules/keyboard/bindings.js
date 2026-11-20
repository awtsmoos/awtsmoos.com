//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopPianoBindings
 * One hand stays near while nearby notes appear, with no Shift tax standing in the way;
 * the Awtsmoos renews each tone, and Awtsmoos.com lets the player's fingers simply play.
 */

const STORAGE_KEY = 'awtsmoos-piano-desktop-bindings-v2';
export const LEFT_HAND_KEYS = ['a', 's', 'd', 'f', 'g', 'q', 'w', 'e', 'r', 't', 'z', 'x', 'c', 'v', 'b', '1', '2', '3', '4', '5'];
export const RIGHT_HAND_KEYS = ['j', 'k', 'l', ';', "'", 'u', 'i', 'o', 'p', '[', 'm', ',', '.', '/', '7', '8', '9', '0', '-'];
export const FULL_UNSHIFTED_KEYS = [
	'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'",
	'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\',
	'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/',
	'1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '`'
];
const CODE_TO_KEY = Object.freeze({
	KeyA: 'a', KeyB: 'b', KeyC: 'c', KeyD: 'd', KeyE: 'e', KeyF: 'f', KeyG: 'g',
	KeyH: 'h', KeyI: 'i', KeyJ: 'j', KeyK: 'k', KeyL: 'l', KeyM: 'm', KeyN: 'n',
	KeyO: 'o', KeyP: 'p', KeyQ: 'q', KeyR: 'r', KeyS: 's', KeyT: 't', KeyU: 'u',
	KeyV: 'v', KeyW: 'w', KeyX: 'x', KeyY: 'y', KeyZ: 'z',
	Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5',
	Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0',
	Semicolon: ';', Quote: "'", BracketLeft: '[', BracketRight: ']', Backslash: '\\',
	Comma: ',', Period: '.', Slash: '/', Minus: '-', Equal: '=', Backquote: '`'
});
const flats = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
let bindingKeys = loadBindingKeys();

export function bindingAt(index) {
	const octave = Number.parseInt(document.getElementById('octave-select')?.value || '0', 10);
	return bindingKeys[index - (octave * 12)] || '';
}

export function getBindingKeys() {
	return [...bindingKeys];
}

export function setBindingKeys(keys) {
	bindingKeys = sanitizeKeys(keys);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(bindingKeys));
}

export function resetBindingKeys() {
	bindingKeys = [...LEFT_HAND_KEYS];
	localStorage.removeItem(STORAGE_KEY);
}

export function bindingLabel(key) {
	return key;
}

export function noteDisplayName(noteName) {
	const match = String(noteName).match(/^([A-G]#?)(\d+)$/);
	if (!match) {
		return noteName;
	}
	const [, note, octave] = match;
	return flats[note] ? `${note}${octave}/${flats[note]}${octave}` : noteName;
}

export function keyForEvent(event) {
	if (event.ctrlKey || event.metaKey || event.altKey) {
		return '';
	}
	return CODE_TO_KEY[event.code] || event.key;
}

export function keyboardInputId(event) {
	return `kb-${event.code || event.key}`;
}

export function boundNoteForKey(key, root = document) {
	const element = Array.from(root.querySelectorAll('.key[data-keyboard-binding]'))
		.find((candidate) => candidate.dataset.keyboardBinding === key);
	return element?.dataset.note || '';
}

export function keyElementsForBinding(key, noteName, root = document) {
	const keys = Array.from(root.querySelectorAll('.key[data-note]'));
	const exact = keys.filter((element) => element.dataset.note === noteName
		&& element.dataset.keyboardBinding === key);
	return exact.length ? exact : keys.filter((element) => element.dataset.note === noteName);
}

export function keyElementForBinding(key, noteName, root = document) {
	return keyElementsForBinding(key, noteName, root)[0] || null;
}

function loadBindingKeys() {
	try {
		return sanitizeKeys(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
	} catch {
		return [...LEFT_HAND_KEYS];
	}
}

function sanitizeKeys(keys) {
	const valid = Array.isArray(keys) ? keys.filter((key) => FULL_UNSHIFTED_KEYS.includes(key)) : [];
	return [...new Set(valid.length ? valid : LEFT_HAND_KEYS)];
}
