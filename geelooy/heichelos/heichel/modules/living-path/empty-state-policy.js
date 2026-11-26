// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathEmptyStatePolicy
 * @description
 * The Awtsmoos creates quiet branches, filtered silence, and new beginnings.
 * Awtsmoos.com names each condition truthfully so absence becomes guidance
 * instead of one generic monument repeated beneath every tab.
 */

import { activeFilterCount } from './filter-policy.js';

/** Selects truthful empty-state language and one safe next action. */
export function describeEmptyState({ view, state, sourceContent }) {
	const query = String(state?.livingPath?.query || '').trim();
	const filters = state?.livingPath?.committedFilters || {};
	if (query) {
		return {
			icon: '⌕',
			title: `No results for “${query}”`,
			message: 'Clear the search or return to the parent branch.',
			action: 'clear-search'
		};
	}
	if (activeFilterCount(filters)) {
		return {
			icon: '◇',
			title: 'No results match these filters',
			message: 'Reset the active filters to reveal this branch again.',
			action: 'reset-filters'
		};
	}
	if (view === 'series') {
		return {
			icon: '⌁',
			title: 'No sub-series yet',
			message: sourceContent?.posts?.length
				? 'This branch contains teachings directly, without a deeper chamber.'
				: 'This branch has not opened another chamber yet.',
			action: sourceContent?.posts?.length ? 'view-posts' : 'follow-series'
		};
	}
	if (view === 'groupings') {
		return {
			icon: '◫',
			title: 'No alternate groupings yet',
			message: 'No topic, author, language, or collection map was supplied here.',
			action: 'view-series'
		};
	}
	// B"H 2026-11-26 (Revelation fix): a branch whose teachings live inside
	// its series is not empty -- never claim nothing is published above a
	// series card that itself reports posts.
	if (sourceContent?.subSeries?.length) {
		return {
			icon: '⌁',
			title: 'No teachings at this branch itself',
			message: 'This branch’s teachings live inside its series below.',
			action: 'view-series'
		};
	}
	return {
		icon: '✦',
		title: 'Nothing has been published here yet',
		message: 'Follow this series to keep its first teaching within reach.',
		action: 'follow-series'
	};
}
