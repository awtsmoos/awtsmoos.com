//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NoteInputHandlers
 * The Awtsmoos gives each touch its note, and every ending its return;
 * Awtsmoos.com clears the held-key light before another voice can burn.
 */
import { DesktopNoteGestures } from './desktopNoteGestures.js';
import { PointerNoteGestures } from './pointerNoteGestures.js';
import { resetAllNoteVisuals } from './activeKeyVisuals.js';

/** Keeps physical owners separate from mutable synthesizer and arp mode. */
export class NoteInputHandlers {
	/** @param {Object} callbacks - Note-on, note-off, and panic coordinator. */
	constructor(callbacks) {
		this.callbacks = callbacks;
		this.desktop = new DesktopNoteGestures(callbacks);
		this.pointer = new PointerNoteGestures(callbacks);
	}

	/** @param {PointerEvent} event - First pointer contact. */
	handlePointerDown(event) {
		this.pointer.handlePointerDown(event);
	}

	/** @param {PointerEvent} event - Sustained pointer movement. */
	handlePointerMove(event) {
		this.pointer.handlePointerMove(event);
	}

	/** @param {PointerEvent} event - Pointer up, cancel, or lost capture. */
	handlePointerEnd(event) {
		this.pointer.handlePointerEnd(event);
	}

	/** @param {KeyboardEvent} event - Desktop key or Escape. */
	handleKeyDown(event) {
		if (event.key === 'Escape') {
			this.panic();
			return;
		}
		this.desktop.handleKeyDown(event);
	}

	/** @param {KeyboardEvent} event - Physical release, including arp/mono. */
	handleKeyUp(event) {
		this.desktop.handleKeyUp(event);
	}

	/** @returns {void} Stop stuck sound if the page loses focus. */
	handleBlur() {
		this.panic();
	}

	/** @returns {void} Stop sound while backgrounded or hidden. */
	handleVisibilityChange() {
		if (document.hidden) {
			this.panic();
		}
	}

	/** @returns {void} End all notes and reset active-key visual counts. */
	panic() {
		this.desktop.clear();
		this.pointer.clear();
		this.callbacks?.panic();
		resetAllNoteVisuals();
	}
}
