//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module WetSynthPresets
 * @description
 * Netzach stretches one oscillator into ocean, cloud, molten copper, and a lead that crosses the stars.
 * The Awtsmoos is infinitely beyond waveform and reverb while continuously creating their finite dance;
 * Awtsmoos.com lets wide synthesis remain expressive, controlled, and playable beneath the hand.
 */

import { composePreset } from './presetFoundation.js';

export const WET_SYNTH_PRESETS = [
	composePreset('wet-neon-ocean', 'Wet • Neon Ocean', {
		wave1: 'sawtooth',
		wave2: 'triangle',
		attack: 0.12,
		decay: 0.38,
		sustain: 0.72,
		release: 1.75,
		filterCutoff: 2800,
		filterQ: 1.7,
		unisonVoices: 5,
		unisonDetune: 22,
		unisonSpread: 0.9,
		unisonGain: 0.46,
		sourceGain: 0.62,
		chorusSend: 0.42,
		delaySend: 0.24,
		delayTime: 0.33,
		delayFeedback: 0.31,
		reverbSend: 0.47
	}),
	composePreset('wet-cosmic-pad', 'Wet • Cosmic Pad', {
		wave1: 'triangle',
		wave2: 'sawtooth',
		attack: 0.62,
		decay: 0.52,
		sustain: 0.76,
		release: 2.8,
		filterCutoff: 2100,
		filterQ: 1.1,
		lfoRate: 0.24,
		lfoToFilter: 82,
		unisonVoices: 4,
		unisonDetune: 16,
		unisonSpread: 0.94,
		unisonGain: 0.36,
		chorusSend: 0.48,
		delaySend: 0.16,
		reverbSend: 0.62,
		outputTrim: 0.78
	}),
	composePreset('wet-molten-analog', 'Wet • Molten Analog', {
		wave1: 'sawtooth',
		wave2: 'square',
		attack: 0.035,
		decay: 0.27,
		sustain: 0.68,
		release: 1.05,
		filterCutoff: 1850,
		filterQ: 3.4,
		env1FilterMult: 2.5,
		unisonVoices: 3,
		unisonDetune: 13,
		unisonSpread: 0.64,
		unisonGain: 0.38,
		saturationDrive: 1.88,
		chorusSend: 0.3,
		delaySend: 0.2,
		delayFeedback: 0.26,
		reverbSend: 0.34
	}),
	composePreset('wet-space-lead', 'Wet • Space Lead', {
		wave1: 'sawtooth',
		wave2: 'triangle',
		attack: 0.012,
		decay: 0.2,
		sustain: 0.72,
		release: 0.92,
		filterCutoff: 3700,
		filterQ: 2.8,
		vibratoRate: 5.2,
		vibratoCents: 8,
		unisonVoices: 4,
		unisonDetune: 15,
		unisonSpread: 0.72,
		unisonGain: 0.42,
		chorusSend: 0.31,
		delaySend: 0.36,
		delayTime: 0.29,
		delayFeedback: 0.39,
		reverbSend: 0.38,
		outputTrim: 0.84
	})
];
