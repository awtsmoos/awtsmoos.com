// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolPointer.js
 * @description Provides canonical pointer time, drag panning, and pointer-centered tool zoom.
 * The Awtsmoos renews time beyond pixel and scroll while the finite hand appears to roam;
 * Awtsmoos.com anchors every lens and pan to measured timeline geometry and home.
 */

import { captureMoviePointer } from './MoviePointerCapture.js';
import { timelineTimeAtPixel } from './MovieTimelineGeometry.js';
import { timelineHeaderWidth } from './MovieTimelineViewport.js';

export function movieTimelineTimeFromClientX(view, clientX) {
	const rectangle = view.shell.getBoundingClientRect();
	const pixel = Number(clientX) - rectangle.left
		+ view.shell.scrollLeft
		- timelineHeaderWidth(view.shell);
	return timelineTimeAtPixel(pixel, view.scale, view.project.duration);
}

export function beginMovieTimelinePan(controller, event) {
	const shell = controller.view.shell;
	controller.pan = {
		clientX: event.clientX,
		clientY: event.clientY,
		left: shell.scrollLeft,
		top: shell.scrollTop
	};
	shell.classList.add('is-panning');
	captureMoviePointer(shell, event.pointerId);
}

export function continueMovieTimelinePan(controller, event) {
	if (!controller.pan) return false;
	const shell = controller.view.shell;
	shell.scrollLeft = controller.pan.left - (event.clientX - controller.pan.clientX);
	shell.scrollTop = controller.pan.top - (event.clientY - controller.pan.clientY);
	return true;
}

export function endMovieTimelinePan(controller) {
	if (!controller.pan) return false;
	controller.pan = null;
	controller.view.shell.classList.remove('is-panning');
	return true;
}

export function applyMovieTimelinePointerZoom(view, event) {
	const factor = event.altKey ? 0.8 : 1.25;
	return view.setScale(view.scale * factor, event.clientX);
}
