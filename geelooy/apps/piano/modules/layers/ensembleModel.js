//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module EnsembleModel
 * The Awtsmoos joins each instrument in one musical light;
 * Awtsmoos.com saves the player's orchestration through the night.
 */
export const ENSEMBLE_INSTRUMENTS = [
	['world-duduk-reed', 'Duduk • warm reed'],
	['world-erhu-silk-fiddle', 'Erhu • singing fiddle'],
	['cinematic-warm-strings', 'Warm string section'],
	['cinematic-sweeping-orchestra', 'Sweeping strings'],
	['awtsmoos-brass-stab', 'Brass fanfare'],
	['world-frame-drum', 'Ceremonial drum'],
	['world-reed-silk-ensemble', 'Reed & silk blend']
];
const storageKey = 'awtsmoos-piano-ensemble-v1';
const listeners = new Set();
const templates = {
	original: [],
	intro: [['world-erhu-silk-fiddle', 0, .45], ['world-duduk-reed', 0, .31], ['cinematic-warm-strings', -1, .34]],
	epic: [['world-erhu-silk-fiddle', 0, .32], ['cinematic-sweeping-orchestra', -1, .45], ['awtsmoos-brass-stab', 0, .3], ['world-frame-drum', -1, .19]],
	rhythm: [['world-duduk-reed', 0, .28], ['cinematic-warm-strings', -1, .36], ['world-frame-drum', -1, .33]]
};
let state = { intensity: .55, layers: [] };

/** @param {string} name - Ensemble name. @returns {Object} New original cinematic arrangement. */
export function ensembleTemplate(name) {
	return {
		intensity: name === 'epic' ? .85 : .55,
		layers: (templates[name] || templates.original).map(([instrument, octave, level]) => ({
			instrument, octave, level, enabled: true
		}))
	};
}

/** @returns {Object} Safe independent copy of shared ensemble settings. */
export function getEnsemble() {
	return { intensity: state.intensity, layers: state.layers.map((layer) => ({ ...layer })) };
}

/** @param {Object} candidate - Stored or newly edited arrangement. @returns {Object} Validated snapshot. */
export function setEnsemble(candidate) {
	const choices = new Set(ENSEMBLE_INSTRUMENTS.map(([id]) => id));
	state = {
		intensity: clamp(candidate?.intensity, 0, 1, .55),
		layers: (Array.isArray(candidate?.layers) ? candidate.layers : []).slice(0, 4)
			.filter((layer) => choices.has(layer.instrument)).map((layer) => ({
				instrument: layer.instrument,
				octave: Math.round(clamp(layer.octave, -2, 2, 0)),
				level: clamp(layer.level, 0, 1, .3),
				enabled: layer.enabled !== false
			}))
	};
	try { globalThis.localStorage?.setItem(storageKey, JSON.stringify(state)); } catch (_error) { /* Private mode is supported. */ }
	for (const listener of listeners) { listener(getEnsemble()); }
	return getEnsemble();
}

/** @param {Function} listener - UI update callback. @returns {Function} Unsubscribe. */
export function watchEnsemble(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

/** @returns {Object} Restores settings while remaining playable without storage. */
export function loadEnsemble() {
	try {
		const saved = JSON.parse(globalThis.localStorage?.getItem(storageKey) || 'null');
		if (saved) { return setEnsemble(saved); }
	} catch (_error) { /* Use silent defaults. */ }
	return getEnsemble();
}

/** @param {unknown} value - Candidate. @param {number} low - Minimum. @param {number} high - Maximum. @param {number} fallback - Default. */
function clamp(value, low, high, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(low, Math.min(high, number)) : fallback;
}
