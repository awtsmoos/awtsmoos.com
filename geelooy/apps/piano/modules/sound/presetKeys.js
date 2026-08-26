//B"H
//Boruch Hashem
//Blessed is He
/**
 * Keys can strike, bloom, or glitter while the Awtsmoos remains the hidden source.
 * Awtsmoos.com gives synthetic piano a pitched hammer and electric keys their own gentler course.
 */

import { composePreset } from './presetFoundation.js';

export const KEY_PRESETS = [
	composePreset('awtsmoos-techno-piano-stab', 'Club Techno Piano Stab XL', {
		wave1: 'sawtooth',
		wave2: 'triangle',
		attack: 0.002,
		decay: 0.17,
		sustain: 0.24,
		release: 0.27,
		oscMix: 0.35,
		detuneCents: 3,
		filterCutoff: 5200,
		filterQ: 1.1,
		env1FilterMult: 1.5,
		transientMs: 22,
		transientGain: 0.055,
		hammerAmount: 0.24,
		hammerDecay: 0.12,
		hammerWave: 'triangle',
		sourceGain: 0.82,
		chorusSend: 0.07,
		delaySend: 0.04,
		reverbSend: 0.22,
		saturationDrive: 1.42
	}),
	composePreset('awtsmoos-deep-rhodes', 'Deep Synth Rhodes', {
		wave1: 'triangle',
		wave2: 'sine',
		attack: 0.008,
		decay: 0.28,
		sustain: 0.54,
		release: 0.72,
		filterCutoff: 2900,
		filterQ: 1.4,
		fmIndex: 0.14,
		fmTone: 'warm',
		transientMs: 18,
		transientGain: 0.04,
		chorusSend: 0.34,
		reverbSend: 0.3,
		saturationDrive: 1.3
	}),
	composePreset('awtsmoos-velvet-wurli', 'Velvet Synth Wurli', {
		wave1: 'square',
		wave2: 'triangle',
		attack: 0.006,
		decay: 0.23,
		sustain: 0.48,
		release: 0.5,
		filterCutoff: 2500,
		filterQ: 1.8,
		fmIndex: 0.08,
		fmTone: 'warm',
		transientMs: 18,
		transientGain: 0.045,
		hammerAmount: 0.035,
		hammerDecay: 0.07,
		chorusSend: 0.28,
		saturationDrive: 1.54
	}),
	composePreset('websynth-8op-fm-glass', 'FM Glass Keys', {
		wave1: 'sine',
		wave2: 'triangle',
		attack: 0.004,
		decay: 0.42,
		sustain: 0.3,
		release: 0.92,
		oscMix: 0.25,
		filterCutoff: 5900,
		filterQ: 1,
		fmIndex: 0.72,
		fmTone: 'glass',
		chorusSend: 0.18,
		delaySend: 0.16,
		reverbSend: 0.42,
		saturationDrive: 1.12
	}),
	composePreset('warm-rhodes-cloud', 'Warm Rhodes Cloud', {
		wave1: 'triangle',
		wave2: 'sine',
		attack: 0.04,
		decay: 0.36,
		sustain: 0.63,
		release: 1.35,
		filterCutoff: 2400,
		filterQ: 1.1,
		fmIndex: 0.07,
		fmTone: 'warm',
		chorusSend: 0.42,
		reverbSend: 0.48,
		saturationDrive: 1.22
	})
];
