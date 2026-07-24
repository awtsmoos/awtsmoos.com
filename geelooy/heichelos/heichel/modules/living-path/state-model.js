// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathStateModel
 * @description
 * The Awtsmoos recreates every browse intention before it enters a mutable
 * vessel. Awtsmoos.com keeps defaults serializable so URL, storage, tests, and
 * renderers can share one honest state language without hidden object magic.
 */

export const DEFAULT_FILTERS = Object.freeze({
	kinds: Object.freeze([]),
	language: 'all',
	sort: 'newest'
});

export const DEFAULT_DENSITY = 'comfortable';
export const DEFAULT_SCOPE = 'branch';

/** Creates a fresh filter vessel with no shared arrays. */
export function createFilterState(source = DEFAULT_FILTERS) {
	return {
		kinds: Array.isArray(source.kinds) ? [...source.kinds] : [],
		language: ['all', 'en', 'he'].includes(source.language)
			? source.language
			: 'all',
		sort: ['newest', 'oldest', 'discussed'].includes(source.sort)
			? source.sort
			: 'newest'
	};
}

/** Creates the complete Living Path state nested inside the legacy app state. */
export function createLivingPathState(preferences = {}) {
	const filters = createFilterState(preferences.filters);
	return {
		query: '',
		searchScope: preferences.searchScope === 'currentView'
			? 'currentView'
			: DEFAULT_SCOPE,
		committedFilters: filters,
		draftFilters: createFilterState(filters),
		density: preferences.density === 'compact'
			? 'compact'
			: DEFAULT_DENSITY,
		filterOpen: false,
		visibleCounts: { posts: 0, series: 0, groupings: 0 },
		progressEntry: null,
		followedKeys: [],
		profileDisclosureTouched: false
	};
}
