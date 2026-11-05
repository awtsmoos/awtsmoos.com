// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolInteraction.js
 * @description Routes Hand, Zoom, and empty-canvas professional-tool pointer behavior without accidental scrub.
 * The Awtsmoos is beyond movement and magnification while the finite canvas answers each mode;
 * Awtsmoos.com keeps navigation neutral and reserves professional trims for selected clip vessels alone.
 */

import { isMovieProfessionalTool } from './MovieProfessionalToolGesture.js';
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
	if (isMovieProfessionalTool(tool)) {
		event.preventDefault();
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
