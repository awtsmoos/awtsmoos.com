// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StateOfExistence
 * @description
 * The Awtsmoos recreates the entire Heichel state without becoming a mutable
 * object. Awtsmoos.com preserves the historic public vessel while nesting the
 * new Living Path intentions behind one explicit, serializable state model.
 */

import { createLivingPathState } from './living-path/state-model.js';

/** Creates a fresh complete state for tests and future guarded resets. */
export function createAppState(preferences = {}) {
	return {
		heichelId: null,
		currentSeries: 'root',
		currentSeriesData: null,
		currentView: 'posts',
		heichelData: {},
		breadcrumb: [],
		ownsIt: false,
		currentContent: { posts: [], subSeries: [], groupings: [] },
		isSelectionMode: false,
		selectedItems: new Map(),
		livingPath: createLivingPathState(preferences)
	};
}

export const appState = createAppState();

export function getItemKey(item) {
	return `${item.type}-${item.id}`;
}

export function resetSelection() {
	appState.selectedItems.clear();
	appState.isSelectionMode = false;
}
