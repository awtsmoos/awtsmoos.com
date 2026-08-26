//B"H
//Boruch Hashem
//Blessed is He
/**
 * Club patches gather harmonics like sparks around a dancing flame.
 * The Awtsmoos gives each detuned voice a measured place; Awtsmoos.com makes the stack feel wide without letting loudness replace grace.
 */

import { composePreset } from './presetFoundation.js';

export const CLUB_PRESETS = [
	composePreset('awtsmoos-dream-electric', 'Awtsmoos Club Supersaw XL', {
		filterCutoff: 3400,
		filterQ: 1.9,
		detuneCents: 10,
		unisonVoices: 5,
		unisonDetune: 24,
		unisonSpread: 0.78,
		unisonGain: 0.5,
		sourceGain: 0.7,
		chorusSend: 0.25,
		delaySend: 0.09,
		reverbSend: 0.15,
		noiseGain: 0,
		saturationDrive: 1.35,
		outputTrim: 0.92
	}),
	composePreset('awtsmoos-main-wet-keys', 'Festival Super Lead XL', {
		filterCutoff: 3900,
		filterQ: 2,
		env1FilterMult: 2.45,
		detuneCents: 18,
		unisonVoices: 5,
		unisonDetune: 32,
		unisonSpread: 0.9,
		unisonGain: 0.58,
		sourceGain: 0.64,
		sustain: 0.62,
		release: 0.46,
		chorusSend: 0.38,
		delaySend: 0.18,
		reverbSend: 0.24,
		saturationDrive: 1.52
	}),
	composePreset('bitcrush-chip-lab', 'Neon Techno Pluck', {
		wave1: 'square',
		wave2: 'sawtooth',
		attack: 0.002,
		decay: 0.09,
		sustain: 0.12,
		release: 0.16,
		filterCutoff: 4200,
		filterQ: 3.4,
		env1FilterMult: 2.7,
		detuneCents: 5,
		unisonVoices: 2,
		unisonDetune: 10,
		unisonSpread: 0.45,
		unisonGain: 0.16,
		sourceGain: 0.84,
		delaySend: 0.26,
		delayTime: 0.19,
		delayFeedback: 0.34,
		reverbSend: 0.1
	}),
	composePreset('awtsmoos-cardboard-wet', 'Warehouse Bass Synth', {
		wave1: 'sawtooth',
		wave2: 'square',
		filterCutoff: 430,
		filterQ: 4.2,
		env1FilterMult: 2.1,
		detuneCents: 4,
		stereoSpread: 0.08,
		sustain: 0.58,
		release: 0.24,
		chorusSend: 0.04,
		delaySend: 0.03,
		reverbSend: 0.04,
		saturationDrive: 2.05,
		sourceGain: 1.04
	}),
	composePreset('hoover-rave-cloud', 'Rave Hoover Superstack', {
		wave1: 'sawtooth',
		wave2: 'square',
		filterCutoff: 2200,
		filterQ: 3,
		detuneCents: 20,
		unisonVoices: 5,
		unisonDetune: 40,
		unisonSpread: 0.92,
		unisonGain: 0.62,
		sourceGain: 0.58,
		env2PitchCents: 16,
		env2Decay: 0.12,
		lfoRate: 1.8,
		lfoToFilter: 85,
		chorusSend: 0.4,
		reverbSend: 0.27,
		saturationDrive: 1.72
	})
];
