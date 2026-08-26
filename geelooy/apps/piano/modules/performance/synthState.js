//B"H
//Boruch Hashem
//Blessed is He
/**
 * Played notes enter a shared state ledger while the Awtsmoos renews each instant of their being.
 * Awtsmoos.com clears sound and mirrored light together so hidden state never outruns what the user is seeing.
 */

import { deactivateActiveNoteVisuals } from '../keyboard/activeKeyVisuals.js';
import { applyCurrentParameters, stopSynth } from '../sound/synthVoice.js';

const MAX_LIVE_NOTES = 40;

export const activeNotes = new Map();
export let currentChordNodes = [];
export let currentChordRoot = null;
export let noteHistory = [];

/** Stops played and chord voices while clearing every mirrored visual key. */
export function panicStopAll() {
	activeNotes.forEach((activeNote) => {
		deactivateActiveNoteVisuals(activeNote);
		stopSynth(activeNote.synthNodes, true);
	});
	activeNotes.clear();
	clearCurrentChord(true);
}

/** Steals the oldest played voice before a new note would exceed the live-note cap. */
export function enforceVoiceLimit() {
	while (activeNotes.size >= MAX_LIVE_NOTES) {
		const oldestId = activeNotes.keys().next().value;
		const activeNote = activeNotes.get(oldestId);
		deactivateActiveNoteVisuals(activeNote);
		stopSynth(activeNote?.synthNodes, true);
		activeNotes.delete(oldestId);
	}
}

/** Refreshes every currently sounding played and generated chord voice. */
export function updateAllActiveNotesParameters() {
	activeNotes.forEach((activeNote) => {
		applyCurrentParameters(activeNote.synthNodes);
	});
	currentChordNodes.forEach((nodes) => {
		applyCurrentParameters(nodes, true, false);
	});
}

/** Replaces the current generated chord voice collection. */
export function setCurrentChordNodes(nodes) {
	currentChordNodes = nodes;
}

/** Stores the root pitch class for the current generated chord. */
export function setCurrentChordRoot(root) {
	currentChordRoot = root;
}

/** Releases the current generated chord and resets its root. */
export function clearCurrentChord(fast = false) {
	currentChordNodes.forEach((nodes) => {
		stopSynth(nodes, fast);
	});
	currentChordNodes = [];
	currentChordRoot = null;
}
