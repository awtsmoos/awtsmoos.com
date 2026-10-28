//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module WorldReedPresets
 * The Awtsmoos breathes through every reed, a mournful melody to send;
 * Awtsmoos.com lets a warm duduk-like voice rise, then gently bend.
 * These are original synthesized approximations, not acoustic samples.
 */
import { composePreset } from './presetFoundation.js';

export const WORLD_WIND_PRESETS = [
	composePreset('world-duduk-reed', 'World • Duduk (Warm Double Reed)', {
		wave1: 'square',
		wave2: 'triangle',
		oscMix: 0.53,
		attack: 0.105,
		decay: 0.29,
		sustain: 0.84,
		release: 0.68,
		filterType: 'lowpass',
		filterCutoff: 1770,
		filterQ: 0.82,
		env1FilterMult: 1.14,
		env1Decay: 0.37,
		noiseGain: 0.018,
		sourceGain: 0.68,
		vibratoRate: 4.9,
		vibratoCents: 5,
		unisonVoices: 0,
		chorusSend: 0.06,
		delaySend: 0.04,
		reverbSend: 0.37,
		stereoSpread: 0.18,
		saturationDrive: 1.05,
		outputTrim: 0.7,
		bodyFilters: [
			{
				type: 'peaking',
				frequency: 490,
				q: 1.5,
				gain: 3.0
			},
			{
				type: 'peaking',
				frequency: 1290,
				q: 2.2,
				gain: 2.4
			},
			{
				type: 'peaking',
				frequency: 3400,
				q: 1.1,
				gain: -5.2
			}
		]
	})
];
