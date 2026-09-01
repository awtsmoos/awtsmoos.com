//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoArpeggiator
 * @description
 * Netzach turns held possibility into ordered recurring notes while its separate clock and voice vessels carry time and teardown.
 * The Awtsmoos is beyond repetition while recreating every pulse as absolutely new;
 * Awtsmoos.com keeps held-note memory and musical sequence policy here so Panic can end the river without one module secretly owning every concern.
 */

import {
	arpeggiatorClockIsRunning,
	clearArpeggiatorClock,
	scheduleArpeggiatorClock
} from './arpeggiatorClock.js';
import { buildArpeggiatorSequence } from './arpeggiatorSequence.js';
import {
	arpeggiatorGateSeconds,
	arpeggiatorStepSeconds
} from './arpeggiatorTiming.js';
import {
	startArpeggiatorVoice,
	stopArpeggiatorVoice
} from './arpeggiatorVoice.js';
import { performanceState } from './performanceState.js';

const heldNotes = new Map();
let stepIndex = 0;

/**
 * Gives one physical or MIDI note to the arpeggiator held-note ledger.
 *
 * @param {string} noteName - Scientific pitch name.
 * @param {string|number} inputId - Original input owner.
 * @param {Object} coords - Performance coordinates including optional velocity.
 * @returns {void}
 */
export function holdArpeggiatorNote(noteName, inputId, coords = {}) {
	heldNotes.set(inputId, {
		noteName,
		coords,
		inputId
	});
	if (!arpeggiatorClockIsRunning() && heldNotes.size === 1) {
		stepIndex = 0;
		runStep();
	}
}

/**
 * Removes one physical owner and stops scheduling once no held notes remain.
 *
 * @param {string|number} inputId - Original input owner.
 * @returns {void}
 */
export function releaseArpeggiatorNote(inputId) {
	heldNotes.delete(inputId);
	if (heldNotes.size === 0) {
		panicArpeggiator();
	}
}

/** Clears held notes, timers, and the currently generated voice. @returns {void} */
export function panicArpeggiator() {
	heldNotes.clear();
	clearArpeggiatorClock();
	stopArpeggiatorVoice();
	stepIndex = 0;
}

/** @returns {number} Number of physical or MIDI inputs currently owned by the arp. */
export function heldArpeggiatorNoteCount() {
	return heldNotes.size;
}

function runStep() {
	if (!performanceState.arpEnabled || heldNotes.size === 0) {
		panicArpeggiator();
		return;
	}
	const sequence = buildArpeggiatorSequence(
		[...heldNotes.values()],
		performanceState.arpPattern,
		performanceState.arpOctaves
	);
	if (sequence.length === 0) {
		panicArpeggiator();
		return;
	}
	stopArpeggiatorVoice();
	const record = sequence[stepIndex % sequence.length];
	stepIndex = (stepIndex + 1) % sequence.length;
	startArpeggiatorVoice(record);
	scheduleNextStep();
}

function scheduleNextStep() {
	const stepSeconds = arpeggiatorStepSeconds(
		performanceState.arpBpm,
		performanceState.arpRate
	);
	const gateSeconds = arpeggiatorGateSeconds(
		stepSeconds,
		performanceState.arpGate
	);
	scheduleArpeggiatorClock(
		stepSeconds,
		gateSeconds,
		runStep,
		stopArpeggiatorVoice
	);
}
