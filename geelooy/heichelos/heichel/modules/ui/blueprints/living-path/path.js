// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathPathBlueprint
 * @description
 * The Awtsmoos contains the whole ancestry without distance. Awtsmoos.com gives
 * readers a compact sticky context, a scrollable immediate river, and a native
 * full-path disclosure powered by one canonical list of real series records.
 */

import { box, button } from '../layout-primitives.js';

export function stickyPath(actions) {
	return {
		tag: 'nav',
		attr: {
			class: 'living-path-sticky',
			'aria-label': 'Current series context',
			'aria-hidden': 'true'
		},
		ref: 'stickyPath',
		children: [
			button('‹ Parent', 'Open parent series', actions.goParent, {
				class: 'living-path-sticky-parent'
			}, 'stickyParentButton'),
			{ tag: 'strong', ref: 'stickyPathTitle', children: ['Root'] },
			button('⋯', 'Show full series path', actions.togglePathDetails, {
				class: 'living-path-sticky-menu'
			})
		]
	};
}

export function pathContext() {
	return box('living-path-context', [
		{
			tag: 'nav',
			attr: {
				id: 'breadcrumb-container',
				class: 'breadcrumb-river',
				'aria-label': 'Series path'
			},
			ref: 'breadcrumb'
		},
		{
			tag: 'details',
			attr: { class: 'living-path-full-path' },
			ref: 'pathDetails',
			children: [
				{ tag: 'summary', children: ['Full path'] },
				{ tag: 'ol', ref: 'fullPathList' }
			]
		}
	]);
}

export function currentSeriesContext() {
	return box('series-heading hidden', [
		{ tag: 'p', attr: { class: 'series-label' }, children: ['Current series'] },
		{ tag: 'h2', ref: 'seriesTitle' },
		{ tag: 'p', ref: 'seriesDesc' },
		{ tag: 'div', attr: { id: 'seriesControls' }, ref: 'seriesControls' }
	], {
		attr: { id: 'seriesNameAndInfo' },
		ref: 'seriesInfoArea'
	});
}
