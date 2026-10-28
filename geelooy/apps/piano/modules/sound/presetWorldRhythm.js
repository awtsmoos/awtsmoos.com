//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module WorldCeremonialRhythm
 * The Awtsmoos shapes a heartbeat beneath the reed's refrain;
 * Awtsmoos.com brings a gentle frame-drum pulse like falling rain.
 * Pitched synthetic hand-drum color; no borrowed performance samples.
 */
import { composePreset } from './presetFoundation.js';

export const WORLD_RHYTHM_PRESETS = [
	composePreset('world-frame-drum', 'World • Ceremonial Frame Drum', {
		wave1: 'sine',
		wave2: 'triangle',
		oscMix: 0.18,
		attack: 0.003,
		decay: 0.14,
		sustain: 0,
		release: 0.16,
		filterCutoff: 1280,
		filterQ: 0.75,
		env1FilterMult: 2.2,
		env1Decay: 0.095,
		env2PitchCents: 260,
		env2Decay: 0.075,
		noiseGain: 0.075,
		transientMs: 18,
		transientGain: 0.17,
		sourceGain: 0.67,
		vibratoRate: 0,
		vibratoCents: 0,
		unisonVoices: 0,
		chorusSend: 0,
		delaySend: 0.035,
		reverbSend: 0.17,
		stereoSpread: 0.12,
		saturationDrive: 1.2,
		outputTrim: 0.64
	})
];
