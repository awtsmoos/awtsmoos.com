// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraGestureRuntime.js
 * @description Owns pointer lifecycle, touch pinch, mouse chords, and complete transient release.
 * The Awtsmoos gives every gesture a beginning and end; Awtsmoos.com prevents lost capture,
 * blurred windows, hidden pages, or released buttons from leaving camera or movement state alive.
 */

import { cameraPointerPoint } from './CameraGestureMath.js';
import {
	applyLegacyWheelZoom,
	beginLegacyPinch,
	updateLegacyPinch
} from './CameraLegacyZoom.js';
import {
	captureCameraPointer,
	releaseCameraPointer
} from './CameraPointerCapture.js';

export function installCameraGestureRuntime(owner) {
	owner.canvas.style.touchAction = 'none';
	listen(owner, owner.canvas, 'contextmenu', event => event.preventDefault());
	listen(owner, owner.canvas, 'dblclick', () => owner.canvas.requestPointerLock?.());
	listen(owner, owner.canvas, 'pointerdown', event => beginCameraGesture(owner, event));
	listen(owner, owner.canvas, 'pointermove', event => moveCameraGesture(owner, event));
	listen(owner, owner.canvas, 'pointerup', event => endCameraGesture(owner, event));
	listen(owner, owner.canvas, 'pointercancel', event => endCameraGesture(owner, event));
	listen(owner, owner.canvas, 'lostpointercapture', () => resetCameraGesture(owner));
	listen(owner, owner.canvas, 'wheel', event => {
		applyLegacyWheelZoom(owner.orbit, event);
	}, { passive: false });
	listen(owner, owner.view, 'blur', () => resetCameraGesture(owner));
	listen(owner, owner.view, 'pagehide', () => resetCameraGesture(owner));
	listen(owner, owner.document, 'visibilitychange', () => {
		if (owner.document?.hidden) resetCameraGesture(owner);
	});
}

export function beginCameraGesture(owner, event) {
	if (isMouseGesture(event)) owner.mouse.update(event, 'down');
	captureCameraPointer(owner.canvas, event.pointerId);
	owner.pointers.set(event.pointerId, cameraPointerPoint(event));
	if (owner.pointers.size > 1) {
		owner.pinch = beginLegacyPinch(owner.orbit, owner.pointers);
		return;
	}
	owner.beginDrag(event);
}

export function endCameraGesture(owner, event) {
	if (isMouseGesture(event)) owner.mouse.update(event, 'up');
	if (isMouseGesture(event) && owner.mouse.active) {
		owner.pointers.set(event.pointerId, cameraPointerPoint(event));
		owner.beginDrag(event);
		return;
	}
	releaseCameraPointer(owner.canvas, event.pointerId);
	owner.pointers.delete(event.pointerId);
	owner.drag = null;
	owner.pinch = null;
}

export function moveCameraGesture(owner, event) {
	if (owner.document?.pointerLockElement === owner.canvas) {
		owner.applyLook(event.movementX || 0, event.movementY || 0);
		return;
	}
	if (isMouseGesture(event)) {
		owner.mouse.update(event, 'move');
		if (!owner.mouse.active) {
			owner.drag = null;
			owner.pointers.delete(event.pointerId);
			return;
		}
		owner.pointers.set(event.pointerId, cameraPointerPoint(event));
	}
	if (!owner.pointers.has(event.pointerId)) return;
	owner.pointers.set(event.pointerId, cameraPointerPoint(event));
	if (owner.pointers.size > 1) {
		owner.pinch = updateLegacyPinch(owner.orbit, owner.pointers, owner.pinch);
		return;
	}
	owner.updateDrag(event);
}

export function resetCameraGesture(owner) {
	for (const pointerId of owner.pointers.keys()) {
		releaseCameraPointer(owner.canvas, pointerId);
	}
	owner.pointers.clear();
	owner.mouse.reset();
	owner.drag = null;
	owner.pinch = null;
}

export function destroyCameraGestureRuntime(owner) {
	resetCameraGesture(owner);
	for (const remove of owner.listeners.splice(0)) remove();
}

function listen(owner, target, type, listener, options) {
	target?.addEventListener?.(type, listener, options);
	owner.listeners.push(() => {
		target?.removeEventListener?.(type, listener, options);
	});
}

function isMouseGesture(event) {
	return !event?.pointerType || event.pointerType === 'mouse';
}
