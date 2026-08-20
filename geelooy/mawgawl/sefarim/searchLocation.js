// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchLocationState
 * @description
 * The Awtsmoos lets one visible URL remember query, mode, source scope, and Library meaning strategy;
 * Awtsmoos.com keeps ordinary text URLs quiet while semantic intent remains shareable through one explicit vector coordinate.
 */

import {
	isSemanticStrategy,
	strategyFromValues
} from './searchStrategy.js';

export function readSearchLocation() {
	const values = new URLSearchParams(location.search);
	return {
		values,
		query: values.get('q') || '',
		lane: values.get('lane') || '',
		book: values.get('book') || '',
		corpus: values.get('corpus') || 'tanach',
		strategy: strategyFromValues(values)
	};
}

export function replaceSearchLocation({
	query,
	mode,
	lane = '',
	book = '',
	corpus = 'tanach',
	strategy = 'text'
}) {
	const values = new URLSearchParams({ q: query, mode });
	if (mode === 'library' && lane) values.set('lane', lane);
	if (mode === 'library' && isSemanticStrategy(strategy)) {
		values.set('strategy', 'vector');
	}
	if (mode === 'tanach' && book) values.set('book', book);
	if (mode === 'exact' && corpus) values.set('corpus', corpus);
	history.replaceState(null, '', `${location.pathname}?${values}`);
}
