//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DesktopNoteGestures
 * The Awtsmoos keeps each pressed key within its rightful sound;
 * Awtsmoos.com releases arp and mono when the note is no longer bound.
 */
import {
	boundNoteForKey,
	keyElementForBinding,
	keyForEvent,
	keyboardInputId
} from './bindings.js';

/** Physical desktop key ownership is independent of audible voice mode. */
export class DesktopNoteGestures {
	/** @param {Object} callbacks - Performance note-on/off routing. */
	constructor(callbacks) {
		this.callbacks = callbacks;
		this.pressed = new Set();
	}

	/** @param {KeyboardEvent} event - Physical desktop key press. */
	handleKeyDown(event) {
		if (event.repeat || isTypingTarget(event.target)) {
			return;
		}
		const binding = keyForEvent(event);
		const inputId = keyboardInputId(event);
		if (!binding || this.pressed.has(inputId)) {
			return;
		}
		const noteName = boundNoteForKey(binding);
		const keyElement = keyElementForBinding(binding, noteName);
		if (!noteName || !keyElement) {
			return;
		}
		event.preventDefault();
		this.pressed.add(inputId);
		const rect = keyElement.getBoundingClientRect();
		this.callbacks?.noteOn(
			noteName,
			inputId,
			{ x: rect.width / 2, y: rect.height / 2 },
			keyElement,
			true
		);
	}

	/** @param {KeyboardEvent} event - Release, even when arp/mono owns sound. */
	handleKeyUp(event) {
		const inputId = keyboardInputId(event);
		if (!this.pressed.delete(inputId)) {
			return;
		}
		event.preventDefault();
		this.callbacks?.noteOff(inputId);
	}

	/** @returns {void} Clears held physical keys after panic or lost focus. */
	clear() {
		this.pressed.clear();
	}
}

/** @param {EventTarget} target - Browser event receiver. @returns {boolean} Typing rather than music. */
function isTypingTarget(target) {
	return ['INPUT', 'SELECT', 'TEXTAREA'].includes(target?.tagName)
		|| Boolean(target?.isContentEditable);
}
