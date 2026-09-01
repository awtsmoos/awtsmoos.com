//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module WetKeyPresets
 * @description
 * Chesed lets a struck key overflow its wooden boundary into light, glass, mist, and midnight air.
 * The Awtsmoos is not the effect or the dry signal, yet renews both every instant;
 * Awtsmoos.com gives these wet keys long horizons without dissolving their playable center.
 */

import { composePreset } from './presetFoundation.js';

export const WET_KEY_PRESETS = [
	composePreset('wet-crystal-cathedral', 'Wet • Crystal Cathedral', {
		wave1: 'sine',
		wave2: 'triangle',
		attack: 0.008,
		decay: 0.38,
		sustain: 0.42,
		release: 1.8,
		filterCutoff: 6200,
		fmIndex: 0.62,
		fmTone: 'glass',
		stereoSpread: 0.62,
		chorusSend: 0.34,
		delaySend: 0.26,
		delayTime: 0.375,
		delayFeedback: 0.32,
		reverbSend: 0.58,
		outputTrim: 0.82
	}),
	composePreset('wet-midnight-rhodes', 'Wet • Midnight Rhodes', {
		wave1: 'triangle',
		wave2: 'sine',
		attack: 0.025,
		decay: 0.4,
		sustain: 0.58,
		release: 1.45,
		filterCutoff: 2200,
		filterQ: 1.2,
		fmIndex: 0.1,
		fmTone: 'warm',
		hammerAmount: 0.04,
		chorusSend: 0.46,
		delaySend: 0.18,
		delayTime: 0.31,
		delayFeedback: 0.25,
		reverbSend: 0.46,
		saturationDrive: 1.28
	}),
	composePreset('wet-shimmer-keys', 'Wet • Shimmer Keys', {
		wave1: 'triangle',
		wave2: 'sine',
		attack: 0.004,
		decay: 0.3,
		sustain: 0.38,
		release: 1.18,
		oscMix: 0.32,
		filterCutoff: 5400,
		fmIndex: 0.34,
		fmTone: 'glass',
		transientMs: 18,
		transientGain: 0.035,
		chorusSend: 0.38,
		delaySend: 0.24,
		delayTime: 0.25,
		delayFeedback: 0.27,
		reverbSend: 0.52
	}),
	composePreset('wet-dream-pluck', 'Wet • Dream Pluck', {
		wave1: 'triangle',
		wave2: 'sawtooth',
		attack: 0.002,
		decay: 0.16,
		sustain: 0.18,
		release: 1.25,
		filterCutoff: 3900,
		filterQ: 2.2,
		env1FilterMult: 2.1,
		transientMs: 12,
		transientGain: 0.045,
		stereoSpread: 0.54,
		chorusSend: 0.28,
		delaySend: 0.34,
		delayTime: 0.285,
		delayFeedback: 0.38,
		reverbSend: 0.44,
		outputTrim: 0.86
	})
];
