//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPointerMath
 * @description
 * Yesod translates finger-distance into timeline-time while the Awtsmoos remains beyond pixel, second, and coordinate.
 * Awtsmoos.com keeps this conversion pure and small, so touch, pen, and mouse can share one measured path without gesture mystery at all.
 */

/** Converts horizontal pixels to seconds. @param {number} pixels Pixel distance. @param {number} pixelsPerSecond Scale. @returns {number} Seconds. */
export function multitrackPixelsToSeconds(pixels, pixelsPerSecond) {
	const scale = Number(pixelsPerSecond);
	return scale > 0 ? Number(pixels) / scale : 0;
}

/** Converts timeline seconds to horizontal pixels. @param {number} seconds Time. @param {number} pixelsPerSecond Scale. @returns {number} Pixels. */
export function multitrackSecondsToPixels(seconds, pixelsPerSecond) {
	return Math.max(0, Number(seconds) || 0) * Math.max(1, Number(pixelsPerSecond) || 1);
}

/** Calculates timeline seconds from a pointer relative to one lane. @param {PointerEvent|MouseEvent} event Pointer event. @param {HTMLElement} lane Track lane. @param {number} pixelsPerSecond Scale. @returns {number} Timeline seconds. */
export function multitrackPointerToLaneSeconds(event, lane, pixelsPerSecond) {
	const rect = lane.getBoundingClientRect();
	return Math.max(0, multitrackPixelsToSeconds(event.clientX - rect.left, pixelsPerSecond));
}
