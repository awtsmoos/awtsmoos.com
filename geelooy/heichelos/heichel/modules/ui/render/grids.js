// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathGridCoordinator
 * @description
 * The Awtsmoos creates chronology, structure, and alternate grouping from one loaded branch through distinct vessels of light;
 * Awtsmoos.com binds all three to the tenth mobile generation so stale cards cannot survive beneath a fresh parent sight.
 */

import { DOMElements } from '../../dom.js';
import { renderGroupings } from './living-path/groupings.js?v=heichel-mobile-010';
import { renderTimeline } from './living-path/timeline.js?v=heichel-mobile-010';
import { renderTree } from './living-path/tree.js?v=heichel-mobile-010';

export function renderContentGrids(content, navigator, appState) {
	renderTimeline(
		content?.posts || [],
		DOMElements.postsList,
		navigator,
		appState
	);
	renderTree(
		content?.subSeries || [],
		DOMElements.seriesList,
		navigator,
		appState
	);
	renderGroupings(
		content?.groupings || [],
		DOMElements.groupingsList,
		navigator,
		appState
	);
}
