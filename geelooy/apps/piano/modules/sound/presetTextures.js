//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module TextureSynthPresets
 * @description
 * Texture sounds stretch a held key into shimmer, darkness, choir, pulse, and drone while the Awtsmoos creates time itself anew.
 * Awtsmoos.com lets long envelopes, motion, space, and detuned color form cinematic rooms,
 * giving the keyboard sounds that behave less like a patch list and more like an instrument that can become a world.
 */

import { composePreset } from './presetFoundation.js';

export const TEXTURE_PRESETS = [
	composePreset('texture-shimmer-atmosphere', 'Texture • Shimmer Atmosphere', {
		wave1: 'triangle',
		wave2: 'sine',
		attack: 0.55,
		decay: 0.7,
		sustain: 0.76,
		release: 3.2,
		filterCutoff: 4300,
		fmIndex: 0.22,
		fmTone: 'glass',
		chorusSend: 0.5,
		delaySend: 0.24,
		reverbSend: 0.7,
		stereoSpread: 0.86
	}),
	composePreset('texture-dark-motion-pad', 'Texture • Dark Motion Pad', {
		wave1: 'sawtooth',
		wave2: 'triangle',
		attack: 0.46,
		decay: 0.64,
		sustain: 0.8,
		release: 2.7,
		filterCutoff: 980,
		filterQ: 3,
		lfoRate: 0.31,
		lfoToFilter: 190,
		chorusSend: 0.34,
		delaySend: 0.17,
		reverbSend: 0.58,
		saturationDrive: 1.35
	}),
	composePreset('texture-glass-choir', 'Texture • Glass Choir', {
		wave1: 'sine',
		wave2: 'triangle',
		attack: 0.38,
		decay: 0.5,
		sustain: 0.72,
		release: 2.45,
		filterCutoff: 5200,
		fmIndex: 0.4,
		fmTone: 'glass',
		vibratoRate: 4.4,
		vibratoCents: 4,
		chorusSend: 0.43,
		reverbSend: 0.62
	}),
	composePreset('texture-vapor-pulse', 'Texture • Vapor Pulse', {
		wave1: 'square',
		wave2: 'triangle',
		attack: 0.01,
		decay: 0.24,
		sustain: 0.5,
		release: 1.2,
		filterCutoff: 2400,
		filterQ: 2.2,
		lfoRate: 2.1,
		lfoToFilter: 150,
		delaySend: 0.32,
		delayTime: 0.25,
		delayFeedback: 0.38,
		reverbSend: 0.35
	}),
	composePreset('texture-cosmic-drone', 'Texture • Cosmic Drone', {
		wave1: 'sawtooth',
		wave2: 'sine',
		attack: 0.85,
		decay: 0.8,
		sustain: 0.88,
		release: 3.6,
		filterCutoff: 1450,
		filterQ: 1.4,
		unisonVoices: 5,
		unisonDetune: 20,
		unisonSpread: 0.94,
		unisonGain: 0.4,
		chorusSend: 0.4,
		reverbSend: 0.66,
		outputTrim: 0.74
	})
];
