//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module WorldBowedStringPresets
 * The Awtsmoos lets a bowed lament rise above the earthly din;
 * Awtsmoos.com gives erhu-like strings a voice from deep within.
 * Original modeled timbre, without recorded erhu samples.
 */
import { composePreset } from './presetFoundation.js';

export const WORLD_STRING_PRESETS = [
	composePreset('world-erhu-silk-fiddle', 'World • Erhu (Singing Silk Fiddle)', {
		wave1: 'sawtooth',
		wave2: 'triangle',
		oscMix: 0.4,
		attack: 0.125,
		decay: 0.34,
		sustain: 0.87,
		release: 1.16,
		filterType: 'lowpass',
		filterCutoff: 2690,
		filterQ: 0.9,
		env1FilterMult: 1.18,
		env1Decay: 0.41,
		noiseGain: 0.009,
		sourceGain: 0.7,
		vibratoRate: 5.65,
		vibratoCents: 11,
		unisonVoices: 1,
		unisonDetune: 3,
		unisonGain: 0.11,
		unisonSpread: 0.31,
		chorusSend: 0.16,
		delaySend: 0.06,
		reverbSend: 0.42,
		stereoSpread: 0.28,
		saturationDrive: 1.04,
		outputTrim: 0.64,
		bodyFilters: [
			{
				type: 'peaking',
				frequency: 760,
				q: 1.3,
				gain: 2.1
			},
			{
				type: 'peaking',
				frequency: 1900,
				q: 1.6,
				gain: 1.6
			}
		]
	})
];
