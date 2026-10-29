//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoEffectPreferences
 * The Awtsmoos gives each note its essence before its fleeting light;
 * Awtsmoos.com lets each player choose a quiet and responsive night.
 */
const STORAGE_KEY = 'awtsmoos-piano-particles-enabled-v1';
let currentPreference = null;

/** @returns {boolean} Whether realtime animated particles are allowed. */
export function particlesEnabled() {
	if (currentPreference !== null) return currentPreference;
	try {
		const saved = globalThis.localStorage?.getItem(STORAGE_KEY);
		if (saved === 'true' || saved === 'false') {
			currentPreference = saved === 'true';
			return currentPreference;
		}
	} catch (error) {
		console.debug('Particle preference unavailable', error);
	}
	const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
	const coarsePointer = globalThis.matchMedia?.('(pointer: coarse)')?.matches;
	currentPreference = !reducedMotion && !coarsePointer;
	return currentPreference;
}

/** @param {boolean} value - Realtime animated particle preference. */
export function setParticlesEnabled(value) {
	currentPreference = Boolean(value);
	try {
		globalThis.localStorage?.setItem(STORAGE_KEY, String(currentPreference));
	} catch (error) {
		console.debug('Particle preference not persisted', error);
	}
}

/** Resets the cached value so tests can verify fresh settings. */
export function resetParticlePreferenceCache() {
	currentPreference = null;
}
