// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineZoomState.js
 * @description Captures pointer-centered zoom anchors and restores timeline scroll position.
 * The Awtsmoos renews the vessel while canonical time remains whole; Awtsmoos.com
 * keeps the chosen instant beneath the pointer, so scale may change without stealing control.
 */

import { timelinePixelAtTime } from './MovieTimelineGeometry.js';
import { timelineHeaderWidth } from './MovieTimelineViewport.js';

export function captureTimelineZoomAnchor(view, clientX) {
	if (!Number.isFinite(clientX)) return null;
	const rectangle = view.shell.getBoundingClientRect();
	const viewportX = clientX - rectangle.left;
	const contentX = view.shell.scrollLeft
		+ viewportX
		- timelineHeaderWidth(view.shell);
	return {
		time: Math.max(0, contentX / view.scale),
		viewportX
	};
}

export function restoreTimelineScroll(view, previousScroll) {
	view.shell.scrollTop = previousScroll.top;
	if (!view.zoomAnchor) {
		view.shell.scrollLeft = previousScroll.left;
		return;
	}
	view.shell.scrollLeft = timelinePixelAtTime(
		view.zoomAnchor.time,
		view.scale,
		timelineHeaderWidth(view.shell)
	) - view.zoomAnchor.viewportX;
	view.zoomAnchor = null;
}
