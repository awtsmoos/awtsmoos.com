//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PerformanceSynthPresets
 * @description
 * Performance patches answer the hand immediately: lead, strings, organ, clav, and brass become five vessels for one living gesture.
 * The Awtsmoos is beyond performer and instrument while recreating both each instant;
 * Awtsmoos.com shapes these sounds for velocity, sustain, articulation, and musical usefulness rather than spectacle alone.
 */

import { composePreset } from './presetFoundation.js';

export const PERFORMANCE_PRESETS = [
	composePreset('performance-expressive-lead', 'Performance • Expressive Solo Lead', {
		attack: 0.016,
		decay: 0.18,
		sustain: 0.76,
		release: 0.45,
		filterCutoff: 3600,
		filterQ: 2.4,
		vibratoRate: 5.4,
		vibratoCents: 7,
		unisonVoices: 2,
		unisonDetune: 8,
		unisonSpread: 0.34,
		unisonGain: 0.14,
		delaySend: 0.15,
		reverbSend: 0.2
	}),
	composePreset('performance-cinematic-strings', 'Performance • Cinematic Strings', {
		wave1: 'sawtooth',
		wave2: 'triangle',
		attack: 0.42,
		decay: 0.5,
		sustain: 0.82,
		release: 2.2,
		filterCutoff: 2350,
		filterQ: 0.9,
		unisonVoices: 4,
		unisonDetune: 12,
		unisonSpread: 0.82,
		unisonGain: 0.32,
		chorusSend: 0.38,
		reverbSend: 0.55
	}),
	composePreset('performance-gospel-organ', 'Performance • Gospel Organ', {
		wave1: 'square',
		wave2: 'sine',
		attack: 0.004,
		decay: 0.08,
		sustain: 0.92,
		release: 0.28,
		oscMix: 0.28,
		filterCutoff: 3000,
		filterQ: 1.1,
		fmIndex: 0.06,
		fmTone: 'warm',
		chorusSend: 0.24,
		saturationDrive: 1.42,
		reverbSend: 0.18
	}),
	composePreset('performance-funk-clav', 'Performance • Funk Clav', {
		wave1: 'square',
		wave2: 'sawtooth',
		attack: 0.002,
		decay: 0.11,
		sustain: 0.16,
		release: 0.16,
		filterCutoff: 4800,
		filterQ: 2.8,
		env1FilterMult: 2.25,
		transientMs: 12,
		transientGain: 0.06,
		saturationDrive: 1.58,
		reverbSend: 0.08
	}),
	composePreset('performance-power-brass', 'Performance • Power Synth Brass', {
		attack: 0.012,
		decay: 0.2,
		sustain: 0.62,
		release: 0.32,
		filterCutoff: 2850,
		filterQ: 2.1,
		env1FilterMult: 2.6,
		unisonVoices: 4,
		unisonDetune: 18,
		unisonSpread: 0.66,
		unisonGain: 0.36,
		saturationDrive: 1.62,
		reverbSend: 0.17
	})
];
