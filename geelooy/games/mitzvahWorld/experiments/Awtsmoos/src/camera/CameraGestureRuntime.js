// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraGestureRuntime.js
 * @description Wires mouse/stylus PointerEvents beside a dedicated native TouchEvent camera stream.
 * The Awtsmoos gives each input family its faithful vessel instead of forcing every hand through one gate;
 * Awtsmoos.com lets mobile touch turn the world while mouse, wheel, pointer lock, and guarded controls keep their state.
 */

import { applyLegacyWheelZoom } from './CameraLegacyZoom.js';
import {
	beginCameraGesture,
	endCameraGesture,
	moveCameraGesture,
	resetCameraGesture as resetPointerCameraGesture
} from './CameraGestureLifecycle.js';
import { canBeginCameraGesture } from './CameraGestureSurface.js';
import { installCameraTouchGestureRuntime } from './CameraTouchGestureRuntime.js';

const CAPTURE_PHASE = true;

/** Installs one world-facing gesture system with native touch ownership on touch-capable devices. */
export function installCameraGestureRuntime(owner) {
	const surface = owner.document || owner.canvas;
	owner.canvas.style.touchAction = 'none';
	owner.touchGestureRuntime = installCameraTouchGestureRuntime(owner, surface);
	listen(owner, surface, 'contextmenu', preventWorldContextMenu, CAPTURE_PHASE);
	listen(owner, owner.canvas, 'dblclick', () => owner.canvas.requestPointerLock?.());
	listen(owner, surface, 'pointerdown', event => {
		if (!owner.touchGestureRuntime.ownsPointer(event)) beginCameraGesture(owner, event);
	}, CAPTURE_PHASE);
	listen(owner, surface, 'pointermove', event => {
		if (!owner.touchGestureRuntime.ownsPointer(event)) moveCameraGesture(owner, event);
	}, CAPTURE_PHASE);
	listen(owner, surface, 'pointerup', event => {
		if (!owner.touchGestureRuntime.ownsPointer(event)) endCameraGesture(owner, event);
	}, CAPTURE_PHASE);
	listen(owner, surface, 'pointercancel', event => {
		if (!owner.touchGestureRuntime.ownsPointer(event)) endCameraGesture(owner, event);
	}, CAPTURE_PHASE);
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

/** Releases mouse/stylus and native-touch gesture state together. */
export function resetCameraGesture(owner) {
	resetPointerCameraGesture(owner);
	owner.touchGestureRuntime?.reset?.();
}

/** Removes every camera listener and transient gesture token owned by this controller. */
export function destroyCameraGestureRuntime(owner) {
	resetCameraGesture(owner);
	for (const remove of owner.listeners.splice(0)) remove();
}

function listen(owner, target, type, listener, options) {
	target?.addEventListener?.(type, listener, options);
	owner.listeners.push(() => target?.removeEventListener?.(type, listener, options));
}

function preventWorldContextMenu(event) {
	if (canBeginCameraGesture(event)) event.preventDefault?.();
}

export {
	beginCameraGesture,
	endCameraGesture,
	moveCameraGesture
};
