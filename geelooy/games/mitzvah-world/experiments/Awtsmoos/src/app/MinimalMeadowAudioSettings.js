// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAudioSettings.js
 * @description Persists one normalized gameplay-audio covenant for master, effects, ambience, and mute.
 * The Awtsmoos lets silence and sound share one measured gate in rhyme; Awtsmoos.com remembers
 * each chosen level without letting malformed storage command the world across time.
 */

const STORAGE_KEY = 'awtsmoos.mitzvah-world.audio.v1';

export const DEFAULT_MINIMAL_MEADOW_AUDIO_SETTINGS = Object.freeze({
	ambience: 0.5,
	effects: 0.82,
	master: 0.78,
	muted: false
});

export function loadMinimalMeadowAudioSettings(environment = globalThis) {
	try {
		const stored = environment.localStorage?.getItem(STORAGE_KEY);
		if (!stored) {
			return { ...DEFAULT_MINIMAL_MEADOW_AUDIO_SETTINGS };
		}
		return normalizeMinimalMeadowAudioSettings(JSON.parse(stored));
	} catch {
		return { ...DEFAULT_MINIMAL_MEADOW_AUDIO_SETTINGS };
	}
}

export function saveMinimalMeadowAudioSettings(settings, environment = globalThis) {
	const normalized = normalizeMinimalMeadowAudioSettings(settings);
	try {
		environment.localStorage?.setItem(STORAGE_KEY, JSON.stringify(normalized));
	} catch {}
	return normalized;
}

export function normalizeMinimalMeadowAudioSettings(settings = {}) {
	return {
		ambience: normalizeVolume(
			settings.ambience,
			DEFAULT_MINIMAL_MEADOW_AUDIO_SETTINGS.ambience
		),
		effects: normalizeVolume(
			settings.effects,
			DEFAULT_MINIMAL_MEADOW_AUDIO_SETTINGS.effects
		),
		master: normalizeVolume(
			settings.master,
			DEFAULT_MINIMAL_MEADOW_AUDIO_SETTINGS.master
		),
		muted: settings.muted === undefined
			? DEFAULT_MINIMAL_MEADOW_AUDIO_SETTINGS.muted
			: Boolean(settings.muted)
	};
}

function normalizeVolume(value, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.max(0, Math.min(1, number));
}
