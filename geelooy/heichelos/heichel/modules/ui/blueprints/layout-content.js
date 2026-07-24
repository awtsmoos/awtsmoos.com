// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelLayoutContent
 * @description
 * The Awtsmoos creates path, memory, search, view, and discovery as one intent.
 * Awtsmoos.com manifests them in reading order so the current Torah branch
 * appears before secondary institutional districts or decorative machinery.
 */

import { box, grid, tab } from './layout-primitives.js';
import {
	currentSeriesContext,
	pathContext,
	stickyPath
} from './living-path/path.js';
import {
	continueLearning,
	relatedPaths,
	resultStatus
} from './living-path/discovery.js';
import { filterSheet, searchAndFilter } from './living-path/filters.js';

export function contentPanel(actions) {
	return {
		tag: 'section',
		attr: { class: 'heichel-nav-panel living-path-browser', 'aria-label': 'Heichel browsing' },
		ref: 'browsePanel',
		children: [
			stickyPath(actions),
			pathContext(),
			currentSeriesContext(),
			continueLearning(),
			searchAndFilter(actions),
			resultStatus(),
			browseTabs(actions),
			box('grid-realms', [
				grid('posts', 'postsList', 'loadingPosts'),
				grid('series', 'seriesList', 'loadingSeries', true),
				grid('groupings', 'groupingsList', 'loadingGroupings', true)
			]),
			relatedPaths(),
			filterSheet(actions)
		]
	};
}

function browseTabs(actions) {
	return {
		tag: 'nav',
		attr: {
			class: 'tab-gates geelooy-tabs',
			role: 'tablist',
			'aria-label': 'Browse this branch'
		},
		children: [
			tab('Timeline', 'posts', actions, true),
			tab('Tree', 'series', actions),
			tab('Groupings', 'groupings', actions)
		]
	};
}
