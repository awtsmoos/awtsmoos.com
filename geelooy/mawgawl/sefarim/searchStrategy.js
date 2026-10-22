// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchStrategy
 * @description
 * The Awtsmoos lets Library search distinguish literal text discovery from semantic relationship without confusing search modes;
 * Awtsmoos.com keeps the choice finite, URL-safe, history-safe, and explicit while Tanach and Exact remain separate vessels.
 */

export const TEXT_STRATEGY = 'text';
export const VECTOR_STRATEGY = 'vector';

const VALID_STRATEGIES = new Set([
	TEXT_STRATEGY,
	VECTOR_STRATEGY
]);

export function normalizeSearchStrategy(value) {
	return VALID_STRATEGIES.has(value)
		? value
		: TEXT_STRATEGY;
}

export function strategyLabel(value) {
	return normalizeSearchStrategy(value) === VECTOR_STRATEGY
		? 'Semantic'
		: 'Text';
}

const HEBREW_CHARS = /[֐-׿]/;
const LATIN_CHARS = /[A-Za-z]/;

/**
 * Default Library strategy when the URL carries no explicit strategy choice:
 * English questions (Latin letters, no Hebrew) are Semantic by default
 * (owner order 2026-10-22); Hebrew, empty, and non-letter queries keep Text.
 * An explicit strategy parameter always wins over this default.
 */
export function defaultStrategyForQuery(query) {
	const q = (query || '').trim();
	if (!q || HEBREW_CHARS.test(q) || !LATIN_CHARS.test(q)) return TEXT_STRATEGY;
	return VECTOR_STRATEGY;
}

export function strategyFromValues(values) {
	const explicit = values?.get?.('strategy');
	if (explicit != null) return normalizeSearchStrategy(explicit);
	return defaultStrategyForQuery(values?.get?.('q'));
}

export function isSemanticStrategy(value) {
	return normalizeSearchStrategy(value) === VECTOR_STRATEGY;
}
