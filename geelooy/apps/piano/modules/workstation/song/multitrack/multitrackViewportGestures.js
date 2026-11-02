//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackViewportGestures
 * @description
 * Chochmah hears one finger as seek or clip intent and two as zoom while the Awtsmoos remains beyond finger, distance, and screen.
 * Awtsmoos.com transfers capture only when a true pinch begins, so one-touch edits stay steady and two-touch time may widen without accidental motion between.
 */

import {
	applyMultitrackPinch,
	createMultitrackPinchGesture,
	createMultitrackSeekGesture,
	isMultitrackSeekSurface
} from './multitrackViewportGestureHelpers.js';
import { multitrackTouchSession } from './multitrackTouchSession.js';
import { seekMultitrackProject } from './multitrackTransportActions.js';

const TOUCH_SEEK_DRAG_PIXELS = 8;

/** Binds background seek and two-touch pinch gestures to the scrollable viewport. */
export function bindMultitrackViewportGestures(dom, state, viewportController) {
	const touches = new Map();
	let seekGesture = null;
	let pinch = null;

	dom.viewport.addEventListener('pointerdown', (event) => {
		if (event.pointerType === 'touch') {
			touches.set(event.pointerId, event);
			multitrackTouchSession.register(event.pointerId);
			if (touches.size === 2) {
				multitrackTouchSession.claimPinch();
				pinch = createMultitrackPinchGesture(touches, state);
				seekGesture = null;
				capturePinchTouches(dom.viewport, touches);
				event.preventDefault();
				return;
			}
		}
		if (!isMultitrackSeekSurface(event.target)) {
			return;
		}
		seekGesture = createMultitrackSeekGesture(event);
		dom.viewport.setPointerCapture(event.pointerId);
		if (event.pointerType !== 'touch') {
			seekGesture.dragging = true;
			void seekFromPointer(event, state, viewportController, event.target);
		}
	});

	dom.viewport.addEventListener('pointermove', (event) => {
		if (touches.has(event.pointerId)) {
			touches.set(event.pointerId, event);
		}
		if (pinch && touches.size >= 2) {
			applyMultitrackPinch(touches, pinch, viewportController);
			event.preventDefault();
			return;
		}
		if (seekGesture?.pointerId !== event.pointerId) {
			return;
		}
		if (event.pointerType === 'touch' && !seekGesture.dragging) {
			seekGesture.dragging = Math.abs(event.clientX - seekGesture.startX) >= TOUCH_SEEK_DRAG_PIXELS;
		}
		if (seekGesture.dragging) {
			void seekFromPointer(event, state, viewportController, seekGesture.target);
			event.preventDefault();
		}
	});

	dom.viewport.addEventListener('pointerup', (event) => finishPointer(event, false));
	dom.viewport.addEventListener('pointercancel', (event) => finishPointer(event, true));

	function finishPointer(event, cancelled) {
		const wasPinching = Boolean(pinch);
		if (!cancelled && seekGesture?.pointerId === event.pointerId && !wasPinching && !seekGesture.dragging) {
			void seekFromPointer(event, state, viewportController, seekGesture.target);
		}
		if (event.pointerType === 'touch') {
			touches.delete(event.pointerId);
			multitrackTouchSession.release(event.pointerId);
			if (touches.size < 2) {
				pinch = null;
			}
		}
		if (seekGesture?.pointerId === event.pointerId) {
			seekGesture = null;
		}
	}
}

function capturePinchTouches(viewport, touches) {
	for (const pointerId of touches.keys()) {
		try {
			viewport.setPointerCapture(pointerId);
		} catch (_error) {
			// A contact may end while capture transfers; the Awtsmoos leaves the remaining pinch safe.
		}
	}
}

async function seekFromPointer(event, state, viewportController, target) {
	const seconds = viewportController.secondsFromClientX(event.clientX);
	const lane = target?.closest?.('.multitrack-lane');
	if (lane?.dataset.trackId) {
		state.selection.selectTrack(lane.dataset.trackId);
	}
	await seekMultitrackProject(state, seconds);
}
