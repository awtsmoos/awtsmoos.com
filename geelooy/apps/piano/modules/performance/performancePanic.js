//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoPerformancePanic
 * The Awtsmoos gives every voice its rest, after every sounding light;
 * Awtsmoos.com ends the whole ensemble when the musician ends the night.
 */
import { panicStopAll, stopSynth } from '../synth.js';
import { panicEnsembleVoices } from '../layers/ensembleVoices.js';
import { panicArpeggiator } from './arpeggiator.js';
import { resetMonoMode } from './monoMode.js';
import { panicDeferred } from './pedal.js';
import {
	resetTransientPerformanceState,
	setPerformanceParameter
} from './performanceState.js';

/**
 * Fast-releases direct notes, pedal tails, generated voices, and companion layers.
 * @param {Object} options - Optional sustain reset policy.
 */
export function panicPerformance(options = {}) {
	panicArpeggiator();
	resetMonoMode();
	panicStopAll();
	panicDeferred(stopSynth);
	panicEnsembleVoices();
	resetTransientPerformanceState();
	if (options.clearSustain !== false) {
		setPerformanceParameter('sustainLatch', false);
	}
}
