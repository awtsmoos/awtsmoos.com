//B"H
//Boruch Hashem
//Blessed is He
/**
 * Input is the gate where touch becomes tone and visible light without multiplying the hidden voice.
 * The Awtsmoos binds one act to its proper vessels; Awtsmoos.com lets mirrored keyboards rejoice.
 */

import {
	activeNotes,
	clearCurrentChord,
	createSynthNode,
	enforceVoiceLimit,
	panicStopAll,
	startSynth,
	stopSynth
} from './synth.js';
import { activateNoteVisuals, deactivateNoteVisuals } from './keyboard/activeKeyVisuals.js';
import { bindInputListeners } from './keyboard/inputListeners.js';
import { frequencyForNote, noteFrequencies, noteNames } from './keyboard/noteData.js';
import { resolveNoteVisuals, triggerConfiguredChord } from './keyboard/noteInputHelpers.js';
import { recordInputEnd, recordInputStart } from './performance/inputRecording.js';
import { clearDeferred, deferRelease, panicDeferred } from './performance/pedal.js';
import { elements } from './ui.js';
import { showRealtimeEffect } from './visual/liveEffects.js';

export { noteFrequencies, noteNames };

/** Binds pointer, desktop keyboard, blur, visibility, and split-scroll input once. */
export function setupInputListeners() {
	bindInputListeners({
		noteOn: triggerNoteOn,
		noteOff: triggerNoteOff,
		panic: panicEverything
	});
}

/**
 * Starts one musical voice and the correct set of visual key copies.
 *
 * @param {string} noteName Full note name such as C4.
 * @param {string|number} inputId Stable pointer, keyboard, or MIDI identity.
 * @param {{x:number,y:number}} coords Performance coordinates.
 * @param {HTMLElement|null} keyElement Primary visible key, when available.
 * @param {boolean} mirrorVisuals Whether every DOM copy should illuminate.
 */
export function triggerNoteOn(noteName, inputId, coords, keyElement = null, mirrorVisuals = false) {
	if (activeNotes.has(inputId)) {
		triggerNoteOff(inputId);
	}
	const frequency = frequencyForNote(noteName);
	const keyElements = resolveNoteVisuals(noteName, keyElement, mirrorVisuals);
	const primaryElement = keyElements[0];
	if (!frequency || !primaryElement) {
		return;
	}
	enforceVoiceLimit();
	triggerConfiguredChord(noteName);
	clearDeferred(inputId);
	const synthNodes = createSynthNode(false, false, { inputId, coords });
	if (!synthNodes) {
		return;
	}
	startSynth(synthNodes, frequency, noteName);
	const activeNote = {
		synthNodes,
		keyElement: primaryElement,
		keyElements,
		noteName
	};
	activeNotes.set(inputId, activeNote);
	activateNoteVisuals(keyElements);
	showRealtimeEffect(primaryElement, noteName, coords);
	recordInputStart(activeNote, noteName, coords);
}

/** Releases one musical input and clears every visual copy retained for it. */
export function triggerNoteOff(inputId) {
	const activeNote = activeNotes.get(inputId);
	if (!activeNote) {
		return;
	}
	if (!deferRelease(inputId, activeNote)) {
		stopSynth(activeNote.synthNodes);
	}
	deactivateNoteVisuals(activeNote.keyElements || [activeNote.keyElement]);
	const noteName = activeNote.noteName || activeNote.keyElement?.dataset.note || '';
	activeNotes.delete(inputId);
	if (activeNotes.size === 0 && elements.playChordsCheckbox.checked) {
		clearCurrentChord();
	}
	recordInputEnd(activeNote, noteName);
}

function panicEverything() {
	panicStopAll();
	panicDeferred(stopSynth);
}
