//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoInput
 * @description
 * Tiferes receives one note intention and routes it toward Poly, Mono, Mono Glide, or Arp without duplicating the sound engine beneath.
 * The Awtsmoos is beyond every mode while recreating hand, key, event, and tone each instant;
 * Awtsmoos.com keeps ownership explicit so note-off always returns to the same performance vessel that received note-on, even if settings change meanwhile.
 */

import {
	holdArpeggiatorNote,
	releaseArpeggiatorNote
} from './performance/arpeggiator.js';
import {
	startMonoNote,
	stopMonoNote
} from './performance/monoMode.js';
import {
	startExecutedNote,
	stopExecutedNote
} from './performance/noteExecution.js';
import { panicPerformance } from './performance/performancePanic.js';
import { performanceState } from './performance/performanceState.js';
import { bindInputListeners } from './keyboard/inputListeners.js';

export {
	noteFrequencies,
	noteNames
} from './keyboard/noteData.js';

const inputOwners = new Map();

/**
 * Binds pointer, desktop-key, focus, and panic listeners to the performance router.
 *
 * @returns {void}
 */
export function setupInputListeners() {
	bindInputListeners({
		noteOn: triggerNoteOn,
		noteOff: triggerNoteOff,
		panic: panicEverything
	});
}

/**
 * Routes one note-on through the currently selected performance mode.
 *
 * @param {string} noteName - Scientific pitch name.
 * @param {string|number} inputId - Stable physical/MIDI owner.
 * @param {Object} [coords] - Pointer or MIDI performance data.
 * @param {HTMLElement|null} [keyElement=null] - Optional directly hit key.
 * @param {boolean} [mirrorVisuals=false] - Whether both rows should illuminate.
 * @returns {Object|null|undefined} Active note when direct synthesis is used.
 */
export function triggerNoteOn(
	noteName,
	inputId,
	coords = {},
	keyElement = null,
	mirrorVisuals = false
) {
	triggerNoteOff(inputId);
	if (performanceState.arpEnabled) {
		inputOwners.set(inputId, 'arp');
		holdArpeggiatorNote(noteName, inputId, coords);
		return undefined;
	}
	const options = {
		keyElement,
		mirrorVisuals
	};
	if (performanceState.voiceMode !== 'poly') {
		inputOwners.set(inputId, 'mono');
		return startMonoNote(
			noteName,
			inputId,
			coords,
			{
				...options,
				triggerChord: false
			}
		);
	}
	inputOwners.set(inputId, 'poly');
	return startExecutedNote(
		noteName,
		inputId,
		coords,
		options
	);
}

/**
 * Releases one input through the same owner selected at note-on time.
 *
 * @param {string|number} inputId - Stable physical/MIDI owner.
 * @returns {void}
 */
export function triggerNoteOff(inputId) {
	const owner = inputOwners.get(inputId);
	inputOwners.delete(inputId);
	if (owner === 'arp') {
		releaseArpeggiatorNote(inputId);
		return;
	}
	if (owner === 'mono') {
		stopMonoNote(inputId);
		return;
	}
	stopExecutedNote(inputId);
}

function panicEverything() {
	inputOwners.clear();
	panicPerformance();
}
