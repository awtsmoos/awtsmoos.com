//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoMonoMode
 * @description
 * Gevurah limits the direct performance to one owned voice when Mono is chosen, while Glide carries the previous pitch into the new vessel.
 * The Awtsmoos is beyond one and many while recreating both each instant;
 * Awtsmoos.com keeps monophonic ownership outside the synth graph so polyphony remains untouched and mode changes stay reversible.
 */

import { performanceState } from './performanceState.js';
import {
	startExecutedNote,
	stopExecutedNote
} from './noteExecution.js';
import { applyVoiceGlide } from './voiceGlide.js';

let currentMonoInputId = null;
let previousFrequency = null;

/**
 * Starts one monophonic note, replacing the previous owner when necessary.
 *
 * @param {string} noteName - Scientific pitch name.
 * @param {string|number} inputId - Physical or MIDI input identity.
 * @param {Object} coords - Performance coordinates.
 * @param {Object} options - Visual and recording options.
 * @returns {Object|null} Newly active note record.
 */
export function startMonoNote(noteName, inputId, coords, options = {}) {
	if (currentMonoInputId !== null && currentMonoInputId !== inputId) {
		stopExecutedNote(currentMonoInputId);
	}
	const activeNote = startExecutedNote(
		noteName,
		inputId,
		coords,
		options
	);
	if (!activeNote) {
		return null;
	}
	if (performanceState.voiceMode === 'mono-glide') {
		applyVoiceGlide(
			activeNote,
			previousFrequency,
			performanceState.glideSeconds
		);
	}
	previousFrequency = activeNote.frequency;
	currentMonoInputId = inputId;
	return activeNote;
}

/**
 * Releases the current monophonic owner when the matching physical input ends.
 *
 * @param {string|number} inputId - Physical or MIDI input identity.
 * @returns {void}
 */
export function stopMonoNote(inputId) {
	if (currentMonoInputId !== inputId) {
		return;
	}
	stopExecutedNote(inputId);
	currentMonoInputId = null;
}

/** Clears monophonic ownership after panic or a mode transition. @returns {void} */
export function resetMonoMode() {
	if (currentMonoInputId !== null) {
		stopExecutedNote(currentMonoInputId, {
			record: false
		});
	}
	currentMonoInputId = null;
	previousFrequency = null;
}
