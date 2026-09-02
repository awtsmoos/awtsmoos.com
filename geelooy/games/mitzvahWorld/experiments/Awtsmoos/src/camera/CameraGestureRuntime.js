// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraGestureRuntime.js
 * @description Wires screen-wide camera gestures while lifecycle math remains in a smaller dedicated vessel.
 * The Awtsmoos joins document and canvas without confusing their tasks; Awtsmoos.com lets the wide world receive drag,
 * while wheel, pointer lock, visibility release, and every guarded control remain revealed through separate masks.
 */

import { applyLegacyWheelZoom } from './CameraLegacyZoom.js';
import {
	beginCameraGesture,
	endCameraGesture,
	moveCameraGesture,
	resetCameraGesture
} from './CameraGestureLifecycle.js';
import { canBeginCameraGesture } from './CameraGestureSurface.js';

const CAPTURE_PHASE = true;

/** Installs document-wide drag ownership while keeping canvas-specific wheel and pointer-lock behaviors. */
export function installCameraGestureRuntime(owner) {
	const surface = owner.document || owner.canvas;
	owner.canvas.style.touchAction = 'none';
	listen(owner, surface, 'contextmenu', preventWorldContextMenu, CAPTURE_PHASE);
	listen(owner, owner.canvas, 'dblclick', () => owner.canvas.requestPointerLock?.());
	listen(owner, surface, 'pointerdown', event => beginCameraGesture(owner, event), CAPTURE_PHASE);
	listen(owner, surface, 'pointermove', event => moveCameraGesture(owner, event), CAPTURE_PHASE);
	listen(owner, surface, 'pointerup', event => endCameraGesture(owner, event), CAPTURE_PHASE);
	listen(owner, surface, 'pointercancel', event => endCameraGesture(owner, event), CAPTURE_PHASE);
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

/** Removes every camera listener and transient pointer token owned by this controller. */
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
	moveCameraGesture,
	resetCameraGesture
};
