//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the audio settings vessel in this instant, revealing
 * its focused js settings service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Audio settings vessel.
 *
 * Chapter 32: sound becomes a chosen gate. The Awtsmoos lets the player silence
 * all thunder, keep only combat, keep only arena impacts, or hear the whole
 * palace sing.
 */
const KEY = 'sefiraClashAudioMode';
const DEFAULT_MODE = 'all';

/**
 * Reveals the read audio mode behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 */
export function readAudioMode() {
	if (typeof localStorage === 'undefined') return DEFAULT_MODE;
	return normalize(localStorage.getItem(KEY) || DEFAULT_MODE);
}

/**
 * Reveals the write audio mode behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} mode The mode value entering this behavior.
 */
export function writeAudioMode(mode) {
	const value = normalize(mode);
	if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, value);
	return value;
}

/**
 * Reveals the audio allowed behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} category The category value entering this behavior.
 */
export function audioAllowed(category) {
	const mode = readAudioMode();
	if (mode === 'off') return false;
	if (mode === 'all') return true;
	if (mode === 'hits') return category === 'hit' || category === 'charge';
	if (mode === 'world')
		return category === 'wall' || category === 'fall' || category === 'pickup';
	return true;
}

/**
 * Reveals the audio mode options behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 */
export function audioModeOptions() {
	return [
		{ value: 'all', label: 'All Sound' },
		{ value: 'hits', label: 'Hits Only' },
		{ value: 'world', label: 'World Only' },
		{ value: 'off', label: 'Sound Off' }
	];
}

function normalize(mode) {
	return ['all', 'hits', 'world', 'off'].includes(mode) ? mode : DEFAULT_MODE;
}
