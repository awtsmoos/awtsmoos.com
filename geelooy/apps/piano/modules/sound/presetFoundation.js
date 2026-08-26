//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoPresetFoundation
 * @description
 * The Awtsmoos renews every tone from silence into song, whether oscillator, hammer, or recorded breath;
 * Awtsmoos.com begins from one neutral covenant so each named preset adds only the character it truly needs beneath.
 */

export const BASE_PRESET = Object.freeze({
	wave1: 'sawtooth',
	wave2: 'sawtooth',
	chordWave: 'sawtooth',
	bassWave: 'triangle',
	attack: 0.006,
	decay: 0.18,
	sustain: 0.68,
	release: 0.34,
	oscMix: 0.5,
	detuneCents: 14,
	filterType: 'lowpass',
	filterCutoff: 2600,
	filterQ: 2.4,
	env1FilterMult: 1.8,
	env1Decay: 0.18,
	env2PitchCents: 0,
	env2Decay: 0.08,
	lfoRate: 0.7,
	lfoToFilter: 24,
	stereoSpread: 0.36,
	driftCents: 0.7,
	saturationDrive: 1.4,
	effectMode: 'balanced',
	chorusSend: 0.26,
	delaySend: 0.12,
	delayTime: 0.25,
	delayFeedback: 0.22,
	reverbSend: 0.18,
	sourceGain: 0.92,
	noiseGain: 0,
	outputTrim: 0.96,
	fmIndex: 0,
	fmTone: 'warm',
	transientMs: 0,
	transientGain: 0,
	vibratoRate: 0,
	vibratoCents: 0,
	unisonVoices: 0,
	unisonDetune: 0,
	unisonSpread: 0,
	unisonGain: 0,
	unisonWave: 'sawtooth',
	hammerAmount: 0,
	hammerDecay: 0.11,
	hammerWave: 'triangle',
	sampleInstrument: null,
	sampleArticulation: null,
	sampleMix: 0,
	sampleMaxTranspose: 0,
	sampleMaxLateStart: 0.12,
	bodyFilters: Object.freeze([])
});

/**
 * @description Composes one complete immutable-shape preset while retaining stable public identity and cloning body-filter configuration.
 * @param {string} id - Stable persisted preset identifier.
 * @param {string} label - Human-readable sound selector label.
 * @param {Object} [patch={}] - Musical differences from the neutral foundation.
 * @returns {Object} Complete preset record ready for controls and synthesis.
 */
export function composePreset(id, label, patch = {}) {
	return {
		...BASE_PRESET,
		...patch,
		id,
		label,
		bodyFilters: patch.bodyFilters ? [...patch.bodyFilters] : []
	};
}
