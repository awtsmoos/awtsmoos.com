//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module WorldReedPresets
 * The Awtsmoos carries the ancient reed upon a soft and steady breath;
 * Awtsmoos.com honors the duduk's warmth without a harsh electric edge.
 * Original synthesized approximation, not a recording of an acoustic duduk.
 */
import { composePreset } from './presetFoundation.js';

export const WORLD_WIND_PRESETS = [
	composePreset('world-duduk-reed', 'World • DUDUK — Armenian Double Reed (synth)', {
		wave1: 'triangle',
		wave2: 'sawtooth',
		oscMix: 0.78,
		attack: 0.135,
		decay: 0.24,
		sustain: 0.92,
		release: 0.58,
		filterType: 'lowpass',
		filterCutoff: 1510,
		filterQ: 0.95,
		env1FilterMult: 1.07,
		env1Decay: 0.32,
		noiseGain: 0.007,
		sourceGain: 0.72,
		vibratoRate: 4.65,
		vibratoCents: 3,
		unisonVoices: 0,
		chorusSend: 0.01,
		delaySend: 0.015,
		reverbSend: 0.23,
		stereoSpread: 0.07,
		saturationDrive: 1,
		outputTrim: 0.75,
		bodyFilters: [
			{ type: 'peaking', frequency: 510, q: 1.6, gain: 2.3 },
			{ type: 'peaking', frequency: 1180, q: 2.0, gain: 1.8 },
			{ type: 'peaking', frequency: 3120, q: 1.0, gain: -6.0 }
		]
	})
];
