// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathGridCoordinator
 * @description
 * The Awtsmoos creates chronology, structure, and alternate grouping from one
 * loaded branch. Awtsmoos.com delegates each mode to a distinct renderer while
 * preserving the historic `renderContentGrids` entry used by the navigator.
 */

import { DOMElements } from '../../dom.js';
import { renderTimeline } from './living-path/timeline.js';
import { renderTree } from './living-path/tree.js';
import { renderGroupings } from './living-path/groupings.js';

export function renderContentGrids(content, navigator, appState) {
	renderTimeline(content?.posts || [], DOMElements.postsList, navigator, appState);
	renderTree(content?.subSeries || [], DOMElements.seriesList, navigator, appState);
	renderGroupings(content?.groupings || [], DOMElements.groupingsList, navigator, appState);
}
