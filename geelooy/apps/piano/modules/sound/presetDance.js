//B"H
//Boruch Hashem
//Blessed is He
/**
 * Dance patches turn one keyboard into several rooms of motion and pulse.
 * The Awtsmoos gives every room its own vessel; Awtsmoos.com lets trance, future bass, house, and hard dance answer without becoming one blurred impulse.
 */

import { composePreset } from './presetFoundation.js';

export const DANCE_PRESETS = [
	composePreset('classic-trance-stack', 'Classic Trance Stack', {
		attack: 0.012,
		decay: 0.24,
		sustain: 0.7,
		release: 0.8,
		filterCutoff: 4200,
		filterQ: 1.8,
		unisonVoices: 5,
		unisonDetune: 30,
		unisonSpread: 0.88,
		unisonGain: 0.56,
		sourceGain: 0.65,
		chorusSend: 0.38,
		delaySend: 0.16,
		reverbSend: 0.32,
		saturationDrive: 1.3
	}),
	composePreset('future-bass-chord', 'Future Bass Chord', {
		wave2: 'triangle',
		attack: 0.025,
		decay: 0.32,
		sustain: 0.66,
		release: 0.7,
		filterCutoff: 2500,
		filterQ: 2,
		env1FilterMult: 2,
		unisonVoices: 4,
		unisonDetune: 18,
		unisonSpread: 0.9,
		unisonGain: 0.45,
		sourceGain: 0.7,
		chorusSend: 0.35,
		reverbSend: 0.28
	}),
	composePreset('deep-house-organ', 'Deep House Organ', {
		wave1: 'square',
		wave2: 'sine',
		attack: 0.004,
		decay: 0.12,
		sustain: 0.82,
		release: 0.24,
		oscMix: 0.35,
		filterCutoff: 1900,
		filterQ: 1.5,
		fmIndex: 0.04,
		fmTone: 'warm',
		chorusSend: 0.14,
		reverbSend: 0.12,
		sourceGain: 0.82,
		saturationDrive: 1.45,
		bodyFilters: [
			{ type: 'peaking', frequency: 540, q: 1.5, gain: 2.6 },
			{ type: 'peaking', frequency: 1080, q: 1.8, gain: 1.8 }
		]
	}),
	composePreset('house-piano-bright', 'Bright House Piano', {
		wave2: 'triangle',
		attack: 0.002,
		decay: 0.2,
		sustain: 0.22,
		release: 0.3,
		oscMix: 0.3,
		filterCutoff: 5600,
		filterQ: 1,
		transientMs: 20,
		transientGain: 0.04,
		hammerAmount: 0.27,
		hammerDecay: 0.16,
		sourceGain: 0.8,
		reverbSend: 0.2,
		saturationDrive: 1.38
	}),
	composePreset('hard-dance-screech', 'Hard Dance Screech', {
		wave2: 'square',
		filterCutoff: 1600,
		filterQ: 7,
		env1FilterMult: 4,
		unisonVoices: 4,
		unisonDetune: 44,
		unisonSpread: 0.75,
		unisonGain: 0.5,
		sourceGain: 0.62,
		lfoRate: 4.2,
		lfoToFilter: 160,
		saturationDrive: 2.1,
		delaySend: 0.1,
		reverbSend: 0.1
	})
];
