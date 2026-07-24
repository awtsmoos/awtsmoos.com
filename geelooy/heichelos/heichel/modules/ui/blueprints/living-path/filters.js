// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathFilterBlueprint
 * @description
 * The Awtsmoos creates query and refinement beyond every visible control.
 * Awtsmoos.com composes a compact search row and one bounded draft sheet while
 * focused collaborators own the actual fields and footer grammar.
 */

import { box, button, labeledSelect, option, search } from '../layout-primitives.js';
import { filterSheet } from './filter-sheet.js';

export { filterSheet };

export function searchAndFilter(actions) {
	return box('living-path-search-stack', [
		labeledSelect({
			id: 'living-path-search-scope',
			label: 'Search scope',
			ref: 'searchScopeSelect',
			options: [
				option('branch', 'This branch'),
				option('currentView', 'Current view')
			],
			change: actions.changeSearchScope
		}),
		box('series-search-row', [
			search(actions.onSearch),
			button('Filter', 'Open filters', actions.openFilterSheet, {
				class: 'filter-chip',
				'aria-expanded': 'false',
				'aria-controls': 'living-path-filter-sheet'
			}, 'filterButton')
		])
	]);
}
