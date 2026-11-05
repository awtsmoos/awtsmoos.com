// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraGestureRuntime.js
 * @description Gives camera gestures one Pointer Events path so touch, pen, and mouse cannot double-apply rotation through overlapping legacy listeners.
 * The Awtsmoos is One while many hands may touch the world; Awtsmoos.com lets each pointer keep one identity,
 * so the camera turns once per movement, the joystick keeps its own vessel, and cancellation restores the world without a jump.
 */

import { applyLegacyWheelZoom } from './CameraLegacyZoom.js';
import {
	beginCameraGesture,
	endCameraGesture,
	moveCameraGesture,
	resetCameraGesture as resetPointerCameraGesture
} from './CameraGestureLifecycle.js';
import { canBeginCameraGesture } from './CameraGestureSurface.js';

const CAPTURE_PHASE = true;
const POINTER_CAPTURE_OPTIONS = Object.freeze({
	capture: true,
	passive: false
});

/** Installs one Pointer Events gesture system for mouse, pen, and touch. */
export function installCameraGestureRuntime(owner) {
	const surface = owner.document || owner.canvas;
	owner.canvas.style.touchAction = 'none';
	listen(owner, surface, 'contextmenu', preventWorldContextMenu, CAPTURE_PHASE);
	listen(owner, owner.canvas, 'dblclick', () => owner.canvas.requestPointerLock?.());
	listen(owner, surface, 'pointerdown', event => {
		beginCameraGesture(owner, event);
	}, POINTER_CAPTURE_OPTIONS);
	listen(owner, surface, 'pointermove', event => {
		moveCameraGesture(owner, event);
	}, POINTER_CAPTURE_OPTIONS);
	listen(owner, surface, 'pointerup', event => {
		endCameraGesture(owner, event);
	}, POINTER_CAPTURE_OPTIONS);
	listen(owner, surface, 'pointercancel', event => {
		endCameraGesture(owner, event);
	}, POINTER_CAPTURE_OPTIONS);
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

/** Releases every pointer and transient camera gesture token. */
export function resetCameraGesture(owner) {
	resetPointerCameraGesture(owner);
}

/** Removes every camera listener and resets ownership before disposal. */
export function destroyCameraGestureRuntime(owner) {
	resetCameraGesture(owner);
	for (const remove of owner.listeners.splice(0)) {
		remove();
	}
}

/** Registers one removable listener while preserving its exact options object for cleanup. */
function listen(owner, target, type, listener, options) {
	target?.addEventListener?.(type, listener, options);
	owner.listeners.push(() => target?.removeEventListener?.(type, listener, options));
}

/** Prevents context menus only when the same world surface is eligible to begin camera control. */
function preventWorldContextMenu(event) {
	if (canBeginCameraGesture(event)) {
		event.preventDefault?.();
	}
}

export {
	beginCameraGesture,
	endCameraGesture,
	moveCameraGesture
};
