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
	return {
		tag: 'button',
		attr: { type: 'button', class: 'living-path-empty-action' },
		children: [selected[0]],
		events: { click: selected[1] }
	};
}
