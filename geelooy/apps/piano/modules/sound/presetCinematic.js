//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CinematicStringVoices
 * The Awtsmoos gives the silent bow its singing start;
 * Awtsmoos.com lets sweeping strings illuminate the heart.
 * Original orchestral colors, not another composer's melody.
 */
import { composePreset } from './presetFoundation.js';

export const CINEMATIC_PRESETS = [
	composePreset('cinematic-lyrical-violin', 'Orchestra • Lyrical Violin', {
		wave1: 'sawtooth',
		wave2: 'triangle',
		oscMix: 0.3,
		attack: 0.14,
		decay: 0.55,
		sustain: 0.84,
		release: 1.65,
		filterCutoff: 2850,
		filterQ: 0.8,
		vibratoRate: 5.4,
		vibratoCents: 8,
		unisonVoices: 2,
		unisonDetune: 5,
		unisonSpread: 0.52,
		unisonGain: 0.22,
		chorusSend: 0.18,
		reverbSend: 0.43,
		saturationDrive: 1.06,
		outputTrim: 0.68
	}),
	composePreset('cinematic-warm-strings', 'Orchestra • Warm String Ensemble', {
		wave1: 'sawtooth',
		wave2: 'triangle',
		oscMix: 0.45,
		attack: 0.32,
		decay: 0.72,
		sustain: 0.9,
		release: 2.3,
		filterCutoff: 2400,
		vibratoRate: 4.8,
		vibratoCents: 5,
		unisonVoices: 3,
		unisonDetune: 10,
		unisonSpread: 0.78,
		unisonGain: 0.27,
		chorusSend: 0.34,
		reverbSend: 0.57,
		saturationDrive: 1.05,
		outputTrim: 0.64
	}),
	composePreset('cinematic-sweeping-orchestra', 'Orchestra • Sweeping Cinematic Strings', {
		wave1: 'sawtooth',
		wave2: 'triangle',
		oscMix: 0.36,
		attack: 0.68,
		decay: 0.9,
		sustain: 0.91,
		release: 3.2,
		filterCutoff: 3400,
		vibratoRate: 5.1,
		vibratoCents: 7,
		unisonVoices: 3,
		unisonDetune: 13,
		unisonSpread: 0.85,
		unisonGain: 0.28,
		chorusSend: 0.39,
		reverbSend: 0.67,
		saturationDrive: 1.04,
		outputTrim: 0.61
	})
];
