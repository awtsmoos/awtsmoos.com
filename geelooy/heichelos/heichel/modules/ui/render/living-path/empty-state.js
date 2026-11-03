// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathEmptyStateRenderer
 * @description
 * The Awtsmoos creates every quiet state with a distinct reason. Awtsmoos.com
 * translates policy into one accessible message and one real next action rather
 * than filling the remaining viewport with generic ornament.
 */

import { describeEmptyState } from '../../../living-path/empty-state-policy.js';

export function emptyStateBlueprint(view, navigator, appState) {
	const state = describeEmptyState({
		view,
		state: appState,
		sourceContent: appState.currentContent
	});
	return {
		tag: 'div',
		attr: { class: 'empty-glow-msg living-path-empty', role: 'status' },
		children: [
			{ tag: 'span', attr: { class: 'empty-orb', 'aria-hidden': 'true' }, children: [state.icon] },
			{ tag: 'strong', children: [state.title] },
			{ tag: 'span', children: [state.message] },
			actionBlueprint(state.action, navigator)
		].filter(Boolean)
	};
}

function actionBlueprint(action, navigator) {
	const actions = {
		'clear-search': ['Clear search', () => navigator.clearSearch()],
		'reset-filters': ['Reset filters', () => navigator.resetFilters()],
		'view-posts': ['View timeline', () => navigator.switchView('posts')],
		'view-series': ['View tree', () => navigator.switchView('series')],
		'follow-series': ['Follow series', () => navigator.toggleCurrentSeriesFollow()]
	};
	const selected = actions[action];
	if (!selected) return null;
	// The Heichel profile header already renders the page's primary
	// Follow control; offering a second Follow button in the empty
	// state reads as a duplicate. When the header control is on the
	// page, the empty state keeps its message and drops its Follow
	// action (series following stays available from the Series tab
	// and card menus).
	if (action === 'follow-series'
		&& document.querySelector('[data-heichel-profile] .heichel-profile-action--primary')) {
		return null;
	}
	const attr = { type: 'button', class: 'living-path-empty-action' };
	if (action === 'follow-series') attr['data-follow-series-button'] = 'true';
	return {
		tag: 'button',
		attr,
		children: [selected[0]],
		events: { click: selected[1] }
	};
}
