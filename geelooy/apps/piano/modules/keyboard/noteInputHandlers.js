//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NoteInputHandlers
 * @description
 * Hod distinguishes a note gesture from navigation and turns browser events into musical intention.
 * The Awtsmoos is beyond finger and key while creating both together each instant;
 * Awtsmoos.com keeps performance interpretation apart from registration so neither becomes tangled.
 */

import { activeNotes } from '../synth.js';
import {
	boundNoteForKey,
	keyElementForBinding,
	keyForEvent,
	keyboardInputId
} from './bindings.js';

export class NoteInputHandlers {
	/** @param {Object} callbacks - Note-on, note-off, and panic callbacks. */
	constructor(callbacks) {
		this.callbacks = callbacks;
	}

	/** @param {PointerEvent} event - Pointer-down event on a piano key. @returns {void} */
	handlePointerDown(event) {
		const keyElement = event.target.closest('.key');
		if (!keyElement) {
			return;
		}
		if (activeNotes.has(event.pointerId)) {
			this.callbacks?.noteOff(event.pointerId);
		}
		event.preventDefault();
		const rect = keyElement.getBoundingClientRect();
		this.callbacks?.noteOn(
			keyElement.dataset.note,
			event.pointerId,
			{
				x: event.clientX - rect.left,
				y: event.clientY - rect.top
			},
			keyElement,
			false
		);
	}

	/** @param {PointerEvent} event - Pointer terminal event. @returns {void} */
	handlePointerEnd(event) {
		this.callbacks?.noteOff(event.pointerId);
	}

	/** @param {KeyboardEvent} event - Document key-down event. @returns {void} */
	handleKeyDown(event) {
		if (event.key === 'Escape') {
			this.callbacks?.panic();
			return;
		}
		if (event.repeat || this.isTypingTarget(event.target)) {
			return;
		}
		const binding = keyForEvent(event);
		const inputId = keyboardInputId(event);
		if (!binding || activeNotes.has(inputId)) {
			return;
		}
		const noteName = boundNoteForKey(binding);
		const keyElement = keyElementForBinding(binding, noteName);
		if (!noteName || !keyElement) {
			return;
		}
		event.preventDefault();
		const rect = keyElement.getBoundingClientRect();
		this.callbacks?.noteOn(
			noteName,
			inputId,
			{
				x: rect.width / 2,
				y: rect.height / 2
			},
			keyElement,
			true
		);
	}

	/** @param {KeyboardEvent} event - Document key-up event. @returns {void} */
	handleKeyUp(event) {
		const inputId = keyboardInputId(event);
		if (!activeNotes.has(inputId)) {
			return;
		}
		event.preventDefault();
		this.callbacks?.noteOff(inputId);
	}

	/** Releases every active note after focus leaves the page. @returns {void} */
	handleBlur() {
		this.callbacks?.panic();
	}

	/** Releases every active note when the page becomes hidden. @returns {void} */
	handleVisibilityChange() {
		if (document.hidden) {
			this.callbacks?.panic();
		}
	}

	isTypingTarget(target) {
		return ['INPUT', 'SELECT', 'TEXTAREA'].includes(target?.tagName);
	}
}
