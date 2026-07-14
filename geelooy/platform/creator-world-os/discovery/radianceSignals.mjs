// B"H
// Boruch Hashem
// Blessed is He
/** @module RadianceSignals @description Normalizes transparent content-context ranking signals. */

export const RADIANCE_SIGNAL_NAMES = Object.freeze([
	'relevance',
	'sourceProximity',
	'freshness',
	'graphContext',
	'quality',
	'userIntent'
]);

/** Normalizes supported Radiance signals into zero-to-one values. */
export function normalizeRadianceSignals(input = {}) {
	return Object.freeze(Object.fromEntries(RADIANCE_SIGNAL_NAMES.map(name => {
		return [name, clamp(input[name] ?? 0)];
	})));
}

/** Computes a weighted content score without assigning worth to a person. */
export function scoreRadiance(signals, weights = {}) {
	const normalized = normalizeRadianceSignals(signals);
	const entries = Object.entries(normalized);
	const totalWeight = entries.reduce((sum, [name]) => sum + Math.max(0, Number(weights[name] ?? 1)), 0);
	if (!totalWeight) {
		return 0;
	}
	const weighted = entries.reduce((sum, [name, value]) => {
		return sum + value * Math.max(0, Number(weights[name] ?? 1));
	}, 0);
	return Number((weighted / totalWeight).toFixed(6));
}

function clamp(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return 0;
	}
	return Math.min(1, Math.max(0, number));
}
