// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCommandState.js
 * @description Projects immutable history, snapping, primary, and selected-many command state.
 * The Awtsmoos renews action beyond the controller that performs it; Awtsmoos.com
 * gives desktop, mobile, agents, diagnostics, and palettes one finite state witness.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioCommandState(controller) {
	return createMovieProjectSnapshot({
		canRedo: controller.history.canRedo,
		canUndo: controller.history.canUndo,
		hasSelection: controller.selectionSet.items.length > 0,
		selection: controller.selection,
		selectionCount: controller.selectionSet.items.length,
		selectionSet: controller.selectionSet,
		snapping: controller.snapping
	});
}
