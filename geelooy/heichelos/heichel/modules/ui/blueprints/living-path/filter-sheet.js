// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathFilterSheet
 * @description
 * The Awtsmoos creates every draft and committed choice without transition.
 * Awtsmoos.com gives the draft one modal boundary with Close, Reset, preview
 * count, and Apply, keeping the main page calm while refinement stays complete.
 */

import { box, button } from '../layout-primitives.js';
import {
	kindFieldset,
	languageFieldset,
	sortAndDensity
} from './filter-fields.js';

export function filterSheet(actions) {
	return {
		tag: 'aside',
		attr: {
			id: 'living-path-filter-sheet',
			class: 'living-path-filter-sheet hidden',
			role: 'dialog',
			'aria-modal': 'true',
			'aria-labelledby': 'living-path-filter-title'
		},
		ref: 'filterSheet',
		children: [
			button('', 'Close filters', actions.closeFilterSheet, {
				class: 'filter-sheet-backdrop'
			}),
			box('filter-sheet-panel', [
				filterHeader(actions),
				kindFieldset(actions),
				languageFieldset(actions),
				sortAndDensity(actions),
				filterFooter(actions)
			], { ref: 'filterSheetPanel' })
		]
	};
}

function filterHeader(actions) {
	return box('filter-sheet-header', [
		box('filter-sheet-heading', [
			{ tag: 'p', attr: { class: 'living-path-kicker' }, children: ['Refine this branch'] },
			{ tag: 'h2', attr: { id: 'living-path-filter-title' }, children: ['Filters'] }
		]),
		button('×', 'Close filters', actions.closeFilterSheet, {
			class: 'filter-sheet-close'
		})
	]);
}

function filterFooter(actions) {
	return box('filter-sheet-footer', [
		button('Reset', 'Reset filters', actions.resetFilters, {
			class: 'filter-reset'
		}),
		{ tag: 'span', ref: 'filterPreviewCount', children: ['0 results'] },
		button('Show results', 'Apply filters', actions.applyFilters, {
			class: 'filter-apply'
		})
	]);
}
