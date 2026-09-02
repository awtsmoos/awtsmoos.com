// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraTouchGestureRuntime.js
 * @description Gives real touch devices a native camera gesture stream independent of cancellable touch PointerEvents.
 * The Awtsmoos lets the mobile hand cross the meadow without the browser swallowing its song;
 * Awtsmoos.com guards joystick and mitzvah controls while world-touch yaw and pinch continue strong.
 */

import {
	beginLegacyPinch,
	updateLegacyPinch
} from './CameraLegacyZoom.js';
import { canBeginCameraGesture } from './CameraGestureSurface.js';

const TOUCH_OPTIONS = Object.freeze({ capture: true, passive: false });

/** Installs protected non-passive touch gestures when the browser reports an actual touch surface. */
export function installCameraTouchGestureRuntime(owner, surface) {
	if (!touchCapable(owner)) return inactiveTouchRuntime();
	const pointers = new Map();
	const begin = event => beginTouchGesture(owner, pointers, event);
	const move = event => moveTouchGesture(owner, pointers, event);
	const end = event => endTouchGesture(owner, pointers, event);
	listen(owner, surface, 'touchstart', begin);
	listen(owner, surface, 'touchmove', move);
	listen(owner, surface, 'touchend', end);
	listen(owner, surface, 'touchcancel', end);
	return {
		active: true,
		ownsPointer: event => event?.pointerType === 'touch',
		reset: () => resetTouchGesture(owner, pointers)
	};
}

/** Begins only from the open world, never from joystick, JUMP, dialogue, inventory, or other guarded UI. */
function beginTouchGesture(owner, pointers, event) {
	if (!canBeginCameraGesture(event)) return;
	for (const touch of event.changedTouches || []) {
		pointers.set(touchKey(touch), touchPoint(touch));
	}
	if (!pointers.size) return;
	event.preventDefault?.();
	if (pointers.size > 1) {
		owner.drag = null;
		owner.pinch = beginLegacyPinch(owner.orbit, pointers);
		return;
	}
	owner.beginDrag(firstPoint(pointers));
}

/** Moves yaw/pitch or pinch directly from TouchEvents so Android pointer cancellation cannot strand the camera. */
function moveTouchGesture(owner, pointers, event) {
	let moved = false;
	for (const touch of event.changedTouches || []) {
		const key = touchKey(touch);
		if (!pointers.has(key)) continue;
		pointers.set(key, touchPoint(touch));
		moved = true;
	}
	if (!moved) return;
	event.preventDefault?.();
	if (pointers.size > 1) {
		owner.pinch = updateLegacyPinch(owner.orbit, pointers, owner.pinch);
		return;
	}
	owner.updateDrag(firstPoint(pointers));
}

/** Releases owned touches and re-seeds a remaining single-finger drag after pinch. */
function endTouchGesture(owner, pointers, event) {
	let ended = false;
	for (const touch of event.changedTouches || []) {
		ended = pointers.delete(touchKey(touch)) || ended;
	}
	if (!ended) return;
	event.preventDefault?.();
	owner.pinch = null;
	if (pointers.size === 1) {
		owner.beginDrag(firstPoint(pointers));
		return;
	}
	owner.drag = null;
}

function resetTouchGesture(owner, pointers) {
	pointers.clear();
	owner.drag = null;
	owner.pinch = null;
}

function touchCapable(owner) {
	const view = owner.view || {};
	return Number(view.navigator?.maxTouchPoints || 0) > 0 || 'ontouchstart' in view;
}

function inactiveTouchRuntime() {
	return { active: false, ownsPointer: () => false, reset() {} };
}

function touchKey(touch) {
	return `touch:${touch.identifier}`;
}

function touchPoint(touch) {
	const clientX = Number(touch.clientX) || 0;
	const clientY = Number(touch.clientY) || 0;
	return { x: clientX, y: clientY, clientX, clientY };
}

function firstPoint(pointers) {
	return pointers.values().next().value;
}

function listen(owner, target, type, listener) {
	target?.addEventListener?.(type, listener, TOUCH_OPTIONS);
	owner.listeners.push(() => target?.removeEventListener?.(type, listener, TOUCH_OPTIONS));
}
