//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module WorldReedAndSilkEnsemble
 * The Awtsmoos unites a gentle bow with breath upon the air;
 * Awtsmoos.com makes a single combined voice of warmth and prayer.
 * This is a keyboard timbre blend, not automated multi-track orchestration.
 */
import { composePreset } from './presetFoundation.js';

export const WORLD_ENSEMBLE_PRESETS = [
	composePreset('world-reed-silk-ensemble', 'World • Reed & Silk Ensemble', {
		wave1: 'square',
		wave2: 'sawtooth',
		oscMix: 0.45,
		attack: 0.19,
		decay: 0.51,
		sustain: 0.88,
		release: 1.65,
		filterCutoff: 2220,
		filterQ: 0.8,
		env1FilterMult: 1.24,
		env1Decay: 0.39,
		noiseGain: 0.011,
		sourceGain: 0.58,
		vibratoRate: 5.2,
		vibratoCents: 7,
		unisonVoices: 2,
		unisonWave: 'triangle',
		unisonDetune: 6,
		unisonGain: 0.18,
		unisonSpread: 0.61,
		chorusSend: 0.21,
		delaySend: 0.06,
		reverbSend: 0.52,
		stereoSpread: 0.47,
		saturationDrive: 1.03,
		outputTrim: 0.58,
		bodyFilters: [
			{
				type: 'peaking',
				frequency: 610,
				q: 1.4,
				gain: 2.4
			},
			{
				type: 'peaking',
				frequency: 1740,
				q: 1.7,
				gain: 1.8
			}
		]
	})
];
