//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackViewportGestures
 * @description
 * Chochmah hears one finger as seeking and two as zoom while the Awtsmoos remains beyond finger, distance, and screen.
 * Awtsmoos.com waits long enough to distinguish tap from pinch, so a second touch may enlarge time without dragging the red playhead away from its place.
 */

import {
	applyMultitrackPinch,
	createMultitrackPinchGesture,
	createMultitrackSeekGesture,
	isMultitrackSeekSurface,
	removeMultitrackTouch
} from './multitrackViewportGestureHelpers.js';
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
			dom.viewport.setPointerCapture(event.pointerId);
			if (touches.size === 2) {
				pinch = createMultitrackPinchGesture(touches, state);
				seekGesture = null;
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

	dom.viewport.addEventListener('pointerup', (event) => {
		const wasPinching = Boolean(pinch);
		if (seekGesture?.pointerId === event.pointerId && !wasPinching && !seekGesture.dragging) {
			void seekFromPointer(event, state, viewportController, seekGesture.target);
		}
		if (!removeMultitrackTouch(event.pointerId, touches)) {
			pinch = null;
		}
		if (seekGesture?.pointerId === event.pointerId) {
			seekGesture = null;
		}
	});

	dom.viewport.addEventListener('pointercancel', (event) => {
		if (!removeMultitrackTouch(event.pointerId, touches)) {
			pinch = null;
		}
		if (seekGesture?.pointerId === event.pointerId) {
			seekGesture = null;
		}
	});
}

async function seekFromPointer(event, state, viewportController, target) {
	const seconds = viewportController.secondsFromClientX(event.clientX);
	const lane = target?.closest?.('.multitrack-lane');
	if (lane?.dataset.trackId) {
		state.selection.selectTrack(lane.dataset.trackId);
	}
	await seekMultitrackProject(state, seconds);
}
