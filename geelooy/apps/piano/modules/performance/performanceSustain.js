//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoPerformanceSustain
 * @description
 * Chesed lets sound remain after the finger rises, while Gevurah unifies hardware pedal and workstation latch into one bounded sustain truth.
 * The Awtsmoos is beyond held and released while recreating both each instant;
 * Awtsmoos.com keeps two controller sources from fighting by projecting their logical union into the one existing deferred-release engine.
 */

import {
	activeNotes,
	stopSynth
} from '../synth.js';
import { setSustainPedal } from './pedal.js';
import {
	performanceState,
	setPerformanceParameter
} from './performanceState.js';

/**
 * Updates the MIDI pedal source and synchronizes effective sustain.
 *
 * @param {boolean} down - Whether the hardware pedal is depressed.
 * @returns {boolean} Effective sustain after both sources are combined.
 */
export function setMidiSustain(down) {
	setPerformanceParameter('midiSustain', Boolean(down));
	return syncPerformanceSustain();
}

/**
 * Updates the workstation sustain-latch source and synchronizes effective sustain.
 *
 * @param {boolean} down - Whether the UI latch is enabled.
 * @returns {boolean} Effective sustain after both sources are combined.
 */
export function setLatchedSustain(down) {
	setPerformanceParameter('sustainLatch', Boolean(down));
	return syncPerformanceSustain();
}

/**
 * Projects the union of MIDI pedal and UI latch into the existing pedal engine.
 *
 * @returns {boolean} Effective sustain state.
 */
export function syncPerformanceSustain() {
	const sustained = Boolean(
		performanceState.sustainLatch
		|| performanceState.midiSustain
	);
	setSustainPedal(
		sustained,
		activeNotes,
		stopSynth
	);
	return sustained;
}
