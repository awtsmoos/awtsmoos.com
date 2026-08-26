//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAcousticKeyPresets
 * @description
 * The Awtsmoos lets a recorded Steinway hammer enter the same living chain as procedural resilience;
 * Awtsmoos.com gives piano a narrow attack window and a gentle synthetic fallback so remote realism leads without becoming existence.
 */

import { composePreset } from './presetFoundation.js';

export const ACOUSTIC_KEY_PRESETS = [
	composePreset(
		'real-grand-piano',
		'Real Steinway Grand Hybrid',
		{
			wave1: 'triangle',
			wave2: 'sine',
			attack: 0.002,
			decay: 0.08,
			sustain: 0.9,
			release: 0.55,
			oscMix: 0.28,
			filterCutoff: 7200,
			filterQ: 0.8,
			sourceGain: 0.1,
			hammerAmount: 0.045,
			hammerDecay: 0.08,
			sampleInstrument: 'piano',
			sampleArticulation: 'mf',
			sampleMix: 0.98,
			sampleMaxTranspose: 5,
			sampleMaxLateStart: 0.07,
			chorusSend: 0.02,
			delaySend: 0.01,
			reverbSend: 0.24,
			saturationDrive: 1.06
		}
	)
];
