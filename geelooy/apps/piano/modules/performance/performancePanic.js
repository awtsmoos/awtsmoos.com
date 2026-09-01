//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoPerformancePanic
 * @description
 * Gevurah closes every performance vessel at once: direct notes, mono ownership, arpeggiator timers, sustain memory, chord voices, and temporary expression.
 * The Awtsmoos is beyond sound and silence while recreating both each instant;
 * Awtsmoos.com gives Escape, blur, visibility loss, and the workstation Panic button one complete ending rather than several partial silences.
 */

import {
	panicStopAll,
	stopSynth
} from '../synth.js';
import { panicArpeggiator } from './arpeggiator.js';
import { resetMonoMode } from './monoMode.js';
import { panicDeferred } from './pedal.js';
import {
	resetTransientPerformanceState,
	setPerformanceParameter
} from './performanceState.js';

/**
 * Fast-releases all sound and resets transient performance ownership.
 *
 * @param {Object} [options] - Optional reset policy.
 * @param {boolean} [options.clearSustain=true] - Whether UI sustain latch should also turn off.
 * @returns {void}
 */
export function panicPerformance(options = {}) {
	panicArpeggiator();
	resetMonoMode();
	panicStopAll();
	panicDeferred(stopSynth);
	resetTransientPerformanceState();
	if (options.clearSustain !== false) {
		setPerformanceParameter('sustainLatch', false);
	}
}
