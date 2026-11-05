// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraGestureLifecycle.js
 * @description Advances accepted camera pointers through begin, move, end, pinch, and total release.
 * The Awtsmoos carries one gesture from opening touch to peaceful release without losing its thread;
 * Awtsmoos.com lets wide-world camera motion live while protected mitzvah controls remain separate instead.
 */

import { cameraPointerPoint } from './CameraGestureMath.js';
import {
	beginLegacyPinch,
	updateLegacyPinch
} from './CameraLegacyZoom.js';
import {
	captureCameraPointer,
	releaseCameraPointer
} from './CameraPointerCapture.js';
import { canBeginCameraGesture } from './CameraGestureSurface.js';

/** Begins only on the world-facing surface, preserving every intentional control target. */
export function beginCameraGesture(owner, event) {
	if (!canBeginCameraGesture(event)) return false;
	if (event.pointerType === 'touch') event.preventDefault?.();
	if (isMouseGesture(event)) owner.mouse.update(event, 'down');
	captureCameraPointer(owner.canvas, event.pointerId);
	owner.pointers.set(event.pointerId, cameraPointerPoint(event));
	if (owner.pointers.size > 1) {
		owner.pinch = beginLegacyPinch(owner.orbit, owner.pointers);
		return true;
	}
	owner.beginDrag(event);
	return true;
}

/** Continues an accepted drag across the whole page, matching the historical world input reach. */
export function moveCameraGesture(owner, event) {
	if (owner.document?.pointerLockElement === owner.canvas) {
		owner.applyLook(event.movementX || 0, event.movementY || 0);
		return true;
	}
	if (!owner.pointers.has(event.pointerId)) return false;
	if (event.pointerType === 'touch') event.preventDefault?.();
	if (isMouseGesture(event)) {
		owner.mouse.update(event, 'move');
		if (!owner.mouse.active) {
			owner.drag = null;
			owner.pointers.delete(event.pointerId);
			return false;
		}
	}
	owner.pointers.set(event.pointerId, cameraPointerPoint(event));
	if (owner.pointers.size > 1) {
		owner.pinch = updateLegacyPinch(owner.orbit, owner.pointers, owner.pinch);
		return true;
	}
	owner.updateDrag(event);
	return true;
}

/** Ends only a gesture this camera owns, so a protected UI pointer cannot disturb camera state. */
export function endCameraGesture(owner, event) {
	if (!owner.pointers.has(event.pointerId)) return false;
	if (isMouseGesture(event)) owner.mouse.update(event, 'up');
	if (isMouseGesture(event) && owner.mouse.active) {
		owner.pointers.set(event.pointerId, cameraPointerPoint(event));
		owner.beginDrag(event);
		return true;
	}
	releaseCameraPointer(owner.canvas, event.pointerId);
	owner.pointers.delete(event.pointerId);
	owner.drag = null;
	owner.pinch = null;
	return true;
}

/** Releases every transient camera ownership token after blur, cancellation, or teardown. */
export function resetCameraGesture(owner) {
	for (const pointerId of owner.pointers.keys()) {
		releaseCameraPointer(owner.canvas, pointerId);
	}
	owner.pointers.clear();
	owner.mouse.reset();
	owner.drag = null;
	owner.pinch = null;
}

function isMouseGesture(event) {
	return !event?.pointerType || event.pointerType === 'mouse';
}
