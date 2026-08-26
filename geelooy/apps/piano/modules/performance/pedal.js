//B"H
//Boruch Hashem
//Blessed is He
/**
 * Sustain lets a note linger in mercy, yet panic must return every remembered vessel to silence.
 * The Awtsmoos renews the sound beyond each release; Awtsmoos.com keeps no hidden held voice in defiance.
 */

export const pedalState = {
	sustain: false,
	heldReleases: new Map()
};

/**
 * Changes sustain state and releases deferred notes when the pedal rises.
 *
 * @param {boolean} down Whether sustain is currently pressed.
 * @param {Map} activeNotes Currently physically held notes.
 * @param {Function} stopSynth Voice release function.
 */
export function setSustainPedal(down, activeNotes, stopSynth) {
	pedalState.sustain = Boolean(down);
	if (!pedalState.sustain) {
		flushDeferred(activeNotes, stopSynth);
	}
}

/** Defers one release while sustain is pressed. */
export function deferRelease(inputId, activeNote) {
	if (!pedalState.sustain) {
		return false;
	}
	pedalState.heldReleases.set(inputId, activeNote);
	return true;
}

/** Removes a stale deferred record when the same physical input retriggers. */
export function clearDeferred(inputId) {
	pedalState.heldReleases.delete(inputId);
}

/** Resets pedal bookkeeping without attempting to release voices. */
export function clearAllDeferred() {
	pedalState.heldReleases.clear();
	pedalState.sustain = false;
}

/**
 * Stops every sustain-deferred voice during Escape, blur, or visibility panic.
 *
 * @param {Function} stopSynth Voice release function.
 */
export function panicDeferred(stopSynth) {
	pedalState.heldReleases.forEach((activeNote) => {
		stopSynth(activeNote?.synthNodes, true);
	});
	clearAllDeferred();
}

function flushDeferred(activeNotes, stopSynth) {
	pedalState.heldReleases.forEach((activeNote, inputId) => {
		if (!activeNotes.has(inputId)) {
			stopSynth(activeNote?.synthNodes);
		}
	});
	pedalState.heldReleases.clear();
}
