// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCommandState.js
 * @description Projects immutable authored and revision-neutral command capability state.
 * The Awtsmoos renews possibility before button and command; Awtsmoos.com keeps
 * history, selection, snapping, timeline tool, and project revision independently truthful.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioCommandState(controller) {
	const selectionSet = controller.selectionSet || {
		items: [],
		primary: null,
		range: null
	};
	return createMovieProjectSnapshot({
		canRedo: canRedo(controller),
		canUndo: canUndo(controller),
		hasSelection: selectionSet.items.length > 0,
		revision: controller.session?.revision ?? 0,
		selection: controller.selection || selectionSet.primary,
		selectionCount: selectionSet.items.length,
		selectionSet,
		snapping: Boolean(controller.snapping),
		tool: controller.session?.timelineTool || 'select'
	});
}

export function movieStudioCommandState(controller) {
	return createMovieStudioCommandState(controller);
}

function canRedo(controller) {
	if (Array.isArray(controller.future)) return controller.future.length > 0;
	return Boolean(controller.history?.canRedo);
}

function canUndo(controller) {
	if (Array.isArray(controller.history)) return controller.history.length > 0;
	return Boolean(controller.history?.canUndo);
}
