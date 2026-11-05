// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraTouchGestureState.js
 * @description Keeps drag-versus-pinch transitions separate from native touch ownership and event plumbing.
 * The Awtsmoos gives each count of touches its own clear vessel and lets transitions remain bright;
 * Awtsmoos.com keeps the runtime small while one finger drags and two world fingers pinch the light.
 */

import { beginLegacyPinch } from './CameraLegacyZoom.js';

/** Reconciles owner drag/pinch state after an owned touch enters or leaves the camera set. */
export function applyCameraTouchMode(owner, pointers) {
	if (pointers.size > 1) {
		owner.drag = null;
		owner.pinch = beginLegacyPinch(owner.orbit, pointers);
		return;
	}
	if (pointers.size === 1) {
		owner.pinch = null;
		owner.beginDrag(firstPoint(pointers));
		return;
	}
	owner.drag = null;
	owner.pinch = null;
}

/** Returns the single owned camera point after Gevurah has bounded the set to one. */
export function firstCameraTouchPoint(pointers) {
	return firstPoint(pointers);
}

function firstPoint(pointers) {
	return pointers.values().next().value;
}
