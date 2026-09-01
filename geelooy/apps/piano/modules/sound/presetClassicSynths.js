//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ClassicSynthPresets
 * @description
 * Classic circuits become finite memories of brass, chorus, polyphony, bells, and bass while the Awtsmoos recreates every oscillator now.
 * Awtsmoos.com gathers familiar workstation archetypes into playable modern patches,
 * so the player can reach for known colors without losing the wider palace of synthesis around them.
 */

import { composePreset } from './presetFoundation.js';

export const CLASSIC_SYNTH_PRESETS = [
	composePreset('classic-analog-brass', 'Classic • Analog Brass', {
		attack: 0.035,
		decay: 0.22,
		sustain: 0.68,
		release: 0.42,
		filterCutoff: 2200,
		filterQ: 1.8,
		env1FilterMult: 2.7,
		unisonVoices: 3,
		unisonDetune: 10,
		unisonSpread: 0.42,
		unisonGain: 0.28,
		chorusSend: 0.13,
		saturationDrive: 1.5
	}),
	composePreset('classic-juno-chorus-pad', 'Classic • Juno Chorus Pad', {
		wave1: 'sawtooth',
		wave2: 'square',
		attack: 0.28,
		decay: 0.52,
		sustain: 0.78,
		release: 1.8,
		filterCutoff: 1850,
		filterQ: 1.1,
		lfoRate: 0.34,
		lfoToFilter: 55,
		chorusSend: 0.58,
		reverbSend: 0.43,
		stereoSpread: 0.7
	}),
	composePreset('classic-prophet-poly', 'Classic • Prophet Poly Keys', {
		wave1: 'sawtooth',
		wave2: 'square',
		attack: 0.018,
		decay: 0.34,
		sustain: 0.61,
		release: 0.74,
		filterCutoff: 3100,
		filterQ: 2.2,
		env1FilterMult: 1.9,
		detuneCents: 8,
		chorusSend: 0.2,
		delaySend: 0.08,
		saturationDrive: 1.4
	}),
	composePreset('classic-dx-bell-matrix', 'Classic • DX Bell Matrix', {
		wave1: 'sine',
		wave2: 'triangle',
		attack: 0.003,
		decay: 0.7,
		sustain: 0.22,
		release: 1.7,
		filterCutoff: 7200,
		filterQ: 0.8,
		fmIndex: 0.88,
		fmTone: 'glass',
		delaySend: 0.18,
		reverbSend: 0.45,
		outputTrim: 0.82
	}),
	composePreset('classic-mono-bass', 'Classic • Mono Bass', {
		wave1: 'sawtooth',
		wave2: 'square',
		attack: 0.003,
		decay: 0.17,
		sustain: 0.6,
		release: 0.2,
		filterCutoff: 640,
		filterQ: 4.5,
		env1FilterMult: 3.2,
		stereoSpread: 0.03,
		saturationDrive: 1.9,
		sourceGain: 0.92,
		reverbSend: 0.03
	})
];
