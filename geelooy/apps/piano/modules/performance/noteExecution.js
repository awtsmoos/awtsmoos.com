//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoNoteExecution
 * @description
 * Yesod turns one validated note intention into sound, recording, expression, and eventual release while Malchus handles visible garments elsewhere.
 * The Awtsmoos is beyond seen and unseen while recreating both every instant;
 * Awtsmoos.com keeps note ownership independent of viewport presence so MIDI and arpeggiation remain musical beyond the visible keys.
 */

import {
	activeNotes,
	clearCurrentChord,
	createSynthNode,
	enforceVoiceLimit,
	startSynth,
	stopSynth
} from '../synth.js';
import { frequencyForNote } from '../keyboard/noteData.js';
import { triggerConfiguredChord } from '../keyboard/noteInputHelpers.js';
import { elements } from '../ui.js';
import {
	recordInputEnd,
	recordInputStart
} from './inputRecording.js';
import { applyExpressionToVoice } from './performanceExpression.js';
import {
	beginExecutedNoteVisuals,
	endExecutedNoteVisuals
} from './noteExecutionVisuals.js';
import {
	clearDeferred,
	deferRelease
} from './pedal.js';

/**
 * Starts one direct or generated note through the shared synth engine.
 *
 * @param {string} noteName - Scientific pitch name such as C4.
 * @param {string|number} inputId - Stable owner identity.
 * @param {{x?:number,y?:number,velocity?:number}} coords - Performance coordinates.
 * @param {Object} [options] - Visual, chord, and recording policy.
 * @returns {Object|null} Active-note record when voice creation succeeds.
 */
export function startExecutedNote(
	noteName,
	inputId,
	coords = {},
	options = {}
) {
	if (activeNotes.has(inputId)) {
		stopExecutedNote(inputId, options);
	}
	const frequency = frequencyForNote(noteName);
	if (!frequency) {
		return null;
	}
	enforceVoiceLimit();
	if (options.triggerChord !== false) {
		triggerConfiguredChord(noteName);
	}
	clearDeferred(inputId);
	const synthNodes = createSynthNode(false, false, {
		inputId,
		coords
	});
	if (!synthNodes) {
		return null;
	}
	startSynth(synthNodes, frequency, noteName);
	applyExpressionToVoice(synthNodes);
	const visuals = beginExecutedNoteVisuals(
		noteName,
		options.keyElement || null,
		Boolean(options.mirrorVisuals),
		coords
	);
	const activeNote = {
		synthNodes,
		keyElement: visuals.primaryElement,
		keyElements: visuals.keyElements,
		noteName,
		frequency
	};
	activeNotes.set(inputId, activeNote);
	if (options.record !== false) {
		recordInputStart(activeNote, noteName, coords);
	}
	return activeNote;
}

/**
 * Releases one executed note according to sustain and recording policy.
 *
 * @param {string|number} inputId - Stable owner identity.
 * @param {Object} [options] - Release policy.
 * @returns {Object|null} Released active-note record.
 */
export function stopExecutedNote(inputId, options = {}) {
	const activeNote = activeNotes.get(inputId);
	if (!activeNote) {
		return null;
	}
	const deferred = options.ignoreSustain
		? false
		: deferRelease(inputId, activeNote);
	if (!deferred) {
		stopSynth(activeNote.synthNodes);
	}
	endExecutedNoteVisuals(activeNote);
	activeNotes.delete(inputId);
	if (activeNotes.size === 0 && elements.playChordsCheckbox?.checked) {
		clearCurrentChord();
	}
	if (options.record !== false) {
		recordInputEnd(activeNote, activeNote.noteName || '');
	}
	return activeNote;
}
