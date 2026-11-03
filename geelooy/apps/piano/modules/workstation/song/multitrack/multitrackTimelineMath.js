//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTimelineMath
 * @description
 * Binah translates finger, scroll, zoom, and seconds into one measured language while the Awtsmoos remains beyond all coordinates.
 * Awtsmoos.com keeps the ruler truthful at every scale, so Fit can reveal a long song whole and the playhead may travel without leaping to borders.
 */

export const MIN_MULTITRACK_ZOOM = 0.05;
export const MAX_MULTITRACK_ZOOM = 320;

/** Converts a viewport client X coordinate into canonical timeline seconds. */
export function timelineClientXToSeconds(clientX, geometry) {
	const pixelsPerSecond = safeScale(geometry.pixelsPerSecond);
	const contentX = Number(clientX)
		- Number(geometry.viewportLeft || 0)
		+ Number(geometry.scrollLeft || 0)
		- Number(geometry.headerWidth || 0);
	return Math.max(0, contentX / pixelsPerSecond);
}

/** Converts canonical seconds into content pixels including the sticky header. */
export function timelineSecondsToContentPixels(seconds, geometry) {
	return Number(geometry.headerWidth || 0)
		+ Math.max(0, Number(seconds) || 0) * safeScale(geometry.pixelsPerSecond);
}

/** Calculates a zoom that fits the complete project into usable viewport width. */
export function fitMultitrackZoom(duration, viewportWidth, headerWidth = 0) {
	const usableWidth = Math.max(1, Number(viewportWidth) - Number(headerWidth || 0));
	const safeDuration = Math.max(0.001, Number(duration) || 0);
	return clampZoom(usableWidth / safeDuration);
}

/** Calculates scroll position that keeps the playhead centered whenever bounds allow. */
export function centeredMultitrackScroll(options) {
	const playheadX = timelineSecondsToContentPixels(options.playheadSeconds, options);
	const desired = playheadX - Number(options.viewportWidth || 0) / 2;
	const maximum = Math.max(
		0,
		Number(options.scrollWidth || 0) - Number(options.viewportWidth || 0)
	);
	return clamp(desired, 0, maximum);
}

/** Scales one pinch from a stable origin rather than compounding pointer noise. */
export function pinchMultitrackZoom(originZoom, originDistance, currentDistance) {
	const safeOrigin = Math.max(1, Number(originDistance) || 1);
	const safeCurrent = Math.max(1, Number(currentDistance) || 1);
	return clampZoom(Number(originZoom) * safeCurrent / safeOrigin);
}

/** Returns the Euclidean distance between two active touch pointers. */
export function multitrackPointerDistance(first, second) {
	return Math.hypot(
		Number(second.clientX) - Number(first.clientX),
		Number(second.clientY) - Number(first.clientY)
	);
}

/** Clamps timeline zoom into the editor's broad but finite scale range. */
export function clampZoom(value) {
	return clamp(
		Number(value) || MIN_MULTITRACK_ZOOM,
		MIN_MULTITRACK_ZOOM,
		MAX_MULTITRACK_ZOOM
	);
}

function safeScale(value) {
	return Math.max(MIN_MULTITRACK_ZOOM, Number(value) || MIN_MULTITRACK_ZOOM);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
