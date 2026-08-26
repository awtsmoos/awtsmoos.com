//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAcousticDrumPresets
 * @description
 * The Awtsmoos gives skin and metal a recorded strike whose identity should not be stretched into another drum;
 * Awtsmoos.com keeps exact one-shot pitch and a narrow network window so every transient lands where the hand made it come.
 */

import { composePreset } from './presetFoundation.js';

export const ACOUSTIC_DRUM_PRESETS = [
	composePreset(
		'real-drum-kit',
		'Real Drum + Cymbal Kit',
		{
			wave1: 'triangle',
			wave2: 'sine',
			attack: 0.001,
			decay: 0.05,
			sustain: 1,
			release: 2.8,
			oscMix: 0.2,
			filterCutoff: 9000,
			filterQ: 0.7,
			sourceGain: 0.04,
			sampleInstrument: 'drum-kit',
			sampleArticulation: 'one-shot',
			sampleMix: 1,
			sampleMaxTranspose: 0,
			sampleMaxLateStart: 0.055,
			chorusSend: 0,
			delaySend: 0.01,
			reverbSend: 0.12,
			saturationDrive: 1.1
		}
	)
];
