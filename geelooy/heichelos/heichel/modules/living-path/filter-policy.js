// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathFilterPolicy
 * @description
 * The Awtsmoos creates every loaded record and every reader intention.
 * Awtsmoos.com joins them through pure filtering and sorting, never pretending
 * that a client-side branch search reached records the browser did not load.
 */

import { normalizeCardData, matchesQuery } from '../ui/render/cardData.js';
import { matchesLanguage } from './language-policy.js';
import { createFilterState, DEFAULT_FILTERS } from './state-model.js';

/** Filters all loaded content while respecting branch or current-view scope. */
export function filterLoadedContent(content, options = {}) {
	const filters = createFilterState(options.filters || DEFAULT_FILTERS);
	const query = String(options.query || '');
	const scope = options.searchScope === 'currentView' ? 'currentView' : 'branch';
	const currentView = options.currentView || 'posts';
	return {
		posts: filterCollection(content?.posts, 'post', shouldQuery('posts')),
		subSeries: filterCollection(content?.subSeries, 'series', shouldQuery('series')),
		groupings: filterCollection(content?.groupings, 'grouping', shouldQuery('groupings'))
	};

	function shouldQuery(view) {
		return scope === 'branch' || view === currentView;
	}

	function filterCollection(items = [], type, applyQuery) {
		const cards = items.map(item => ({ item, card: normalizeCardData(item, type) }));
		return cards
			.filter(({ card }) => !applyQuery || matchesQuery(card, query))
			.filter(({ card }) => matchesKinds(card, filters.kinds))
			.filter(({ card }) => matchesLanguage(card, filters.language))
			.sort((left, right) => compareCards(left.card, right.card, filters.sort))
			.map(({ item }) => item);
	}
}

/** Counts active non-default filter dimensions. */
export function activeFilterCount(filters = DEFAULT_FILTERS) {
	let count = Array.isArray(filters.kinds) ? filters.kinds.length : 0;
	if (filters.language && filters.language !== 'all') count += 1;
	if (filters.sort && filters.sort !== 'newest') count += 1;
	return count;
}

/** Counts visible records by route view. */
export function visibleCounts(content = {}) {
	return {
		posts: content.posts?.length || 0,
		series: content.subSeries?.length || 0,
		groupings: content.groupings?.length || 0
	};
}

function matchesKinds(card, kinds) {
	return !kinds?.length || kinds.includes(card.kind) || kinds.includes(card.type);
}

function compareCards(left, right, sort) {
	if (sort === 'discussed') return right.commentsCount - left.commentsCount;
	if (sort === 'oldest') return (left.timestamp || Infinity) - (right.timestamp || Infinity);
	return (right.timestamp || 0) - (left.timestamp || 0);
}
