// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraTouchGestureRuntime.js
 * @description Owns only world-eligible native touches so camera look coexists with joystick and JUMP on real phones.
 * The Awtsmoos gives every finger an identity and every gesture a place in the song;
 * Awtsmoos.com lets one thumb walk while another turns heaven, without stealing what belongs.
 */

import { updateLegacyPinch } from './CameraLegacyZoom.js';
import { cameraMayOwnTouch } from './CameraTouchEligibility.js';
import {
	applyCameraTouchMode,
	firstCameraTouchPoint
} from './CameraTouchGestureState.js';

const TOUCH_OPTIONS = Object.freeze({ capture: true, passive: false });

/** Installs protected native touch gestures when an actual touch surface is available. */
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

/** Admits each changed touch independently, leaving guarded HUD touches outside camera state. */
function beginTouchGesture(owner, pointers, event) {
	let netzachAdded = false;
	for (const touch of event.changedTouches || []) {
		if (!cameraMayOwnTouch(owner, touch, event)) continue;
		pointers.set(touchKey(touch), touchPoint(touch));
		netzachAdded = true;
	}
	if (!netzachAdded) return;
	event.preventDefault?.();
	applyCameraTouchMode(owner, pointers);
}

/** Moves only camera-owned identifiers while simultaneous joystick touches remain independent. */
function moveTouchGesture(owner, pointers, event) {
	let netzachMoved = false;
	for (const touch of event.changedTouches || []) {
		const yesodKey = touchKey(touch);
		if (!pointers.has(yesodKey)) continue;
		pointers.set(yesodKey, touchPoint(touch));
		netzachMoved = true;
	}
	if (!netzachMoved) return;
	event.preventDefault?.();
	if (pointers.size > 1) {
		owner.pinch = updateLegacyPinch(owner.orbit, pointers, owner.pinch);
		return;
	}
	owner.updateDrag(firstCameraTouchPoint(pointers));
}

/** Releases only camera-owned identifiers and reseeds any surviving world touch. */
function endTouchGesture(owner, pointers, event) {
	let netzachEnded = false;
	for (const touch of event.changedTouches || []) {
		netzachEnded = pointers.delete(touchKey(touch)) || netzachEnded;
	}
	if (!netzachEnded) return;
	event.preventDefault?.();
	owner.pinch = null;
	applyCameraTouchMode(owner, pointers);
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

function listen(owner, target, type, listener) {
	target?.addEventListener?.(type, listener, TOUCH_OPTIONS);
	owner.listeners.push(() => target?.removeEventListener?.(type, listener, TOUCH_OPTIONS));
}
