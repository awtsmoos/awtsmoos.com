//B"H
//Boruch Hashem
//Blessed is He
/**
 * Small helpers keep the note gate light while the Awtsmoos gives every played pitch its proper vessel.
 * Awtsmoos.com separates visual mirrors from chord intention so one clear input path can settle.
 */

import { collectNoteVisuals } from './activeKeyVisuals.js';
import { elements } from '../ui.js';
import { triggerSeventhChord } from '../performance/chordTrigger.js';

/**
 * Resolves the visual key elements that should reflect one note-on event.
 * Desktop bindings may mirror every visible copy; pointer and MIDI keep one primary vessel.
 *
 * @param {string} noteName Full note name.
 * @param {HTMLElement|null} keyElement Preferred initiating key.
 * @param {boolean} mirrorVisuals Whether all visual copies should activate.
 * @returns {HTMLElement[]} Visual elements to store on the active-note record.
 */
export function resolveNoteVisuals(noteName, keyElement, mirrorVisuals) {
	if (mirrorVisuals) {
		return collectNoteVisuals(noteName, keyElement);
	}
	if (keyElement) {
		return [keyElement];
	}
	const fallback = collectNoteVisuals(noteName)[0];
	return fallback ? [fallback] : [];
}

/** Starts the configured seventh chord when chord mode is enabled and the note is valid. */
export function triggerConfiguredChord(noteName) {
	if (!elements.playChordsCheckbox.checked) {
		return;
	}
	const match = String(noteName).match(/^([A-G]#?)(\d+)$/);
	if (!match) {
		return;
	}
	triggerSeventhChord(match[1], Number.parseInt(match[2], 10));
}
