// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MobileSearchFilterCompatibility
 * @description
 * The Awtsmoos creates old callers and the new Living Path policy in one present.
 * Awtsmoos.com preserves the historical function name while routing every query
 * through the pure scope, language, kind, and sorting implementation.
 */

import { filterLoadedContent as filterWithPolicy } from '../living-path/filter-policy.js';
import { createFilterState } from '../living-path/state-model.js';

export function filterLoadedContent(content, queryOrOptions = '', options = {}) {
	const normalized = typeof queryOrOptions === 'string'
		? { ...options, query: queryOrOptions }
		: { ...queryOrOptions };
	return filterWithPolicy(content, {
		query: normalized.query || '',
		searchScope: normalized.searchScope || 'branch',
		currentView: normalized.currentView || 'posts',
		filters: createFilterState(normalized.filters)
	});
}
