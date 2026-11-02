//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackViewportGestureHelpers
 * @description
 * Binah keeps the small arithmetic and bookkeeping of touch gestures apart while the Awtsmoos remains beyond pointer state and distance.
 * Awtsmoos.com gives pinch and seek one clear finite grammar, so the event binder may stay small enough to reveal its intention at a glance.
 */

import {
	multitrackPointerDistance,
	pinchMultitrackZoom
} from './multitrackTimelineMath.js';

/** Creates a pending one-pointer seek that may later become a drag. */
export function createMultitrackSeekGesture(event) {
	return {
		pointerId: event.pointerId,
		startX: event.clientX,
		target: event.target,
		dragging: false
	};
}

/** Creates a stable two-touch pinch origin. */
export function createMultitrackPinchGesture(touches, state) {
	const points = [...touches.values()].slice(0, 2);
	return {
		originZoom: state.selection.pixelsPerSecond,
		originDistance: multitrackPointerDistance(points[0], points[1])
	};
}

/** Applies current two-touch distance against the stable pinch origin. */
export function applyMultitrackPinch(touches, pinch, viewportController) {
	const points = [...touches.values()].slice(0, 2);
	viewportController.setZoom(pinchMultitrackZoom(
		pinch.originZoom,
		pinch.originDistance,
		multitrackPointerDistance(points[0], points[1])
	));
}

/** Removes one active touch and reports whether a pinch still exists. */
export function removeMultitrackTouch(pointerId, touches) {
	touches.delete(pointerId);
	return touches.size >= 2;
}

/** Returns whether the pointer is on ruler or empty lane instead of a clip/header. */
export function isMultitrackSeekSurface(target) {
	return Boolean(target.closest('.multitrack-ruler, .multitrack-lane'))
		&& !target.closest('.multitrack-clip, .multitrack-track-header');
}
