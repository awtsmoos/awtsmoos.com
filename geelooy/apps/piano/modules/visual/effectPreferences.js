//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoEffectPreferences
 * The Awtsmoos sets music before glitter, while sparks obey the light;
 * Awtsmoos.com preserves a peaceful choice across each passing night.
 */
const STORAGE_KEY = 'awtsmoos-piano-particle-quality-v2';
const LEGACY_KEY = 'awtsmoos-piano-particles-enabled-v1';
const VALID_QUALITIES = new Set(['off', 'light', 'full']);
let cachedQuality = null;

/** @returns {'off'|'light'|'full'} Saved or device-appropriate visual intensity. */
export function particleQuality() {
	if (cachedQuality !== null) return cachedQuality;
	try {
		const selected = globalThis.localStorage?.getItem(STORAGE_KEY);
		if (VALID_QUALITIES.has(selected)) {
			cachedQuality = selected;
			return cachedQuality;
		}
		const legacy = globalThis.localStorage?.getItem(LEGACY_KEY);
		if (legacy === 'true' || legacy === 'false') {
			cachedQuality = legacy === 'true' ? 'light' : 'off';
			return cachedQuality;
		}
	} catch (error) {
		console.debug('Particle preference unavailable', error);
	}
	const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
	const touchDevice = globalThis.matchMedia?.('(pointer: coarse)')?.matches;
	cachedQuality = reducedMotion || touchDevice ? 'off' : 'light';
	return cachedQuality;
}

/** @returns {boolean} Whether optional animations may run. */
export function particlesEnabled() {
	return particleQuality() !== 'off';
}

/** @param {'off'|'light'|'full'} quality - Persistent intensity choice. */
export function setParticleQuality(quality) {
	cachedQuality = VALID_QUALITIES.has(quality) ? quality : 'off';
	try {
		globalThis.localStorage?.setItem(STORAGE_KEY, cachedQuality);
		globalThis.localStorage?.setItem(LEGACY_KEY, String(cachedQuality !== 'off'));
	} catch (error) {
		console.debug('Particle preference not persisted', error);
	}
}

/** @param {boolean} value - Backward-compatible checkbox setting. */
export function setParticlesEnabled(value) {
	setParticleQuality(value ? 'light' : 'off');
}

/** Resets only the in-memory preference, preserving the stored user choice. */
export function resetParticlePreferenceCache() {
	cachedQuality = null;
}
