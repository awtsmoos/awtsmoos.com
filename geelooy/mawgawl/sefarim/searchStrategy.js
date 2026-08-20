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

export function strategyFromValues(values) {
	return normalizeSearchStrategy(values?.get?.('strategy'));
}

export function isSemanticStrategy(value) {
	return normalizeSearchStrategy(value) === VECTOR_STRATEGY;
}
