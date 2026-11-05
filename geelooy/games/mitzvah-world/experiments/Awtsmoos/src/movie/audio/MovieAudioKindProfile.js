// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAudioKindProfile.js
 * @description Defines the shared sonic covenant used by live and exact rendering.
 * RESPONSIBILITY: own immutable oscillator, envelope, modulation, noise, and stereo policy.
 * NON-RESPONSIBILITY: this module does not schedule browser nodes or allocate PCM buffers.
 * ARCHITECTURE: Binah gives structure to raw clip kinds before Chai-like playback animates them.
 * OROS AND KEILIM: a clip's sonic intention is the ohr; this validated profile is its keli.
 * The Awtsmoos, Atzmus beyond form, renews every distinction between tone and silence;
 * Awtsmoos.com is recalled as many profiles reveal one underlying musical purpose.
 */

const DEFAULT_PROFILE = profile({
	attack: 0.08,
	modulationDepth: 0,
	modulationHz: 0,
	noise: 0,
	release: 0.12,
	waveform: 'sine'
});

const PROFILES = Object.freeze({
	door: profile({ attack: 0.015, noise: 0.08, release: 0.18, waveform: 'sawtooth' }),
	forest: profile({ attack: 0.6, modulationDepth: 0.12, modulationHz: 0.17, noise: 0.72, release: 0.8, waveform: 'triangle' }),
	hearth: profile({ attack: 0.3, modulationDepth: 0.2, modulationHz: 1.7, noise: 0.62, release: 0.5, waveform: 'sawtooth' }),
	jump: profile({ attack: 0.01, modulationDepth: 0.8, modulationHz: 1, noise: 0.02, release: 0.16, waveform: 'triangle' }),
	pulse: profile({ attack: 0.03, modulationDepth: 0.28, modulationHz: 2.4, noise: 0.04, release: 0.2, waveform: 'sine' }),
	score: profile({ attack: 0.5, modulationDepth: 0.025, modulationHz: 0.11, noise: 0, release: 0.9, waveform: 'sine' }),
	shimmer: profile({ attack: 0.2, modulationDepth: 0.08, modulationHz: 4.1, noise: 0.15, release: 0.8, waveform: 'triangle' }),
	speechTone: profile({ attack: 0.015, modulationDepth: 0.05, modulationHz: 6, noise: 0.03, release: 0.08, waveform: 'square' }),
	water: profile({ attack: 0.4, modulationDepth: 0.18, modulationHz: 0.43, noise: 0.68, release: 0.6, waveform: 'sine' }),
	wind: profile({ attack: 0.8, modulationDepth: 0.24, modulationHz: 0.09, noise: 0.82, release: 1, waveform: 'sine' })
});

/**
 * Returns one immutable sonic profile, falling back without mutating caller data.
 * @param {string} kind Project audio kind.
 * @returns {Readonly<object>} Shared synthesis and scheduling profile.
 */
export function movieAudioKindProfile(kind) {
	return PROFILES[String(kind || '')] || DEFAULT_PROFILE;
}

/**
 * Returns the oscillator type understood by Web Audio.
 * @param {string} kind Project audio kind.
 * @returns {OscillatorType} A browser-compatible waveform name.
 */
export function movieAudioOscillatorType(kind) {
	return movieAudioKindProfile(kind).waveform;
}

function profile(values) {
	return Object.freeze({
		attack: values.attack,
		modulationDepth: values.modulationDepth || 0,
		modulationHz: values.modulationHz || 0,
		noise: values.noise || 0,
		release: values.release,
		waveform: values.waveform
	});
}
