// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolInteraction.js
 * @description Routes Hand and Zoom pointer behavior without disturbing Select or Blade semantics.
 * The Awtsmoos is beyond movement and magnification while the finite canvas answers each mode;
 * Awtsmoos.com keeps panning revision-neutral and every zoom anchored to canonical timeline home.
 */

import {
	applyMovieTimelinePointerZoom,
	beginMovieTimelinePan,
	continueMovieTimelinePan,
	endMovieTimelinePan
} from './MovieTimelineToolPointer.js';

export function beginMovieTimelineToolPointer(controller, event) {
	const tool = controller.view.tool;
	if (tool === 'hand') {
		event.preventDefault();
		beginMovieTimelinePan(controller, event);
		return true;
	}
	if (tool === 'zoom') {
		event.preventDefault();
		applyMovieTimelinePointerZoom(controller.view, event);
		return true;
	}
	return false;
}

export function continueMovieTimelineToolPointer(controller, event) {
	return continueMovieTimelinePan(controller, event);
}

export function endMovieTimelineToolPointer(controller) {
	return endMovieTimelinePan(controller);
}
