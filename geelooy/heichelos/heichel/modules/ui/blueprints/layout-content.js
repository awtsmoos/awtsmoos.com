// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLayoutContent
 * @description
 * Search, filter, tabs, breadcrumbs, and content grids remain one coherent browser.
 */

import {
	box,
	button,
	grid,
	search,
	tab
} from './layout-primitives.js';

export function contentPanel(actions, filterButtonRef) {
	return {
		tag: 'section',
		attr: {
			class: 'heichel-nav-panel',
			'aria-label': 'Heichel browsing'
		},
		ref: 'browsePanel',
		children: [
			breadcrumb(),
			seriesHeading(),
			box('series-search-row', [
				search(actions.onSearch),
				button(
					'Filter',
					'Apply current search filter',
					actions.applyFilter,
					{
						class: 'filter-chip',
						'aria-pressed': 'false'
					},
					filterButtonRef
				)
			]),
			browseTabs(actions),
			box('grid-realms', [
				grid('posts', 'postsList', 'loadingPosts'),
				grid('series', 'seriesList', 'loadingSeries', true),
				grid('groupings', 'groupingsList', 'loadingGroupings', true)
			])
		]
	};
}

function breadcrumb() {
	return {
		tag: 'nav',
		attr: {
			id: 'breadcrumb-container',
			class: 'breadcrumb-river',
			'aria-label': 'Series path'
		},
		ref: 'breadcrumb'
	};
}

function seriesHeading() {
	return box(
		'series-heading hidden',
		[
			{
				tag: 'p',
				attr: { class: 'series-label' },
				children: ['Current series']
			},
			{
				tag: 'h2',
				ref: 'seriesTitle'
			},
			{
				tag: 'p',
				ref: 'seriesDesc'
			},
			{
				tag: 'div',
				attr: { id: 'seriesControls' },
				ref: 'seriesControls'
			}
		],
		{
			attr: { id: 'seriesNameAndInfo' },
			ref: 'seriesInfoArea'
		}
	);
}

function browseTabs(actions) {
	return {
		tag: 'nav',
		attr: {
			class: 'tab-gates geelooy-tabs',
			'aria-label': 'Browse content type'
		},
		children: [
			tab('Timeline', 'posts', actions, true),
			tab('Tree', 'series', actions),
			tab('Groupings', 'groupings', actions)
		]
	};
}
