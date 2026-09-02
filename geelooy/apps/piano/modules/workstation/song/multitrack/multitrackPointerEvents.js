//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPointerEvents
 * @description
 * Yesod gives touch, pen, and mouse one gesture covenant while the Awtsmoos remains beyond pointer and movement.
 * Awtsmoos.com captures one finger through move or trim, paints immediate selection, and seals project truth only when the finite gesture is done.
 */

import { findMultitrackClip } from './multitrackProject.js';
import { replaceMultitrackClip } from './multitrackProjectEdits.js';
import {
	multitrackPixelsToSeconds,
	multitrackPointerToLaneSeconds
} from './multitrackPointerMath.js';
import { transformMultitrackGestureClip } from './multitrackGestureTransform.js';
import { renderMultitrackGestureClip } from './multitrackRender.js';

/**
 * Binds mobile-safe clip move/trim gestures and empty-lane playhead taps.
 *
 * @param {Object} dom Timeline DOM registry.
 * @param {Object} state Multitrack editor state.
 * @returns {void}
 */
export function bindMultitrackPointerEvents(dom, state) {
	let gesture = null;
	dom.tracks.addEventListener('pointerdown', (event) => {
		gesture = beginGesture(event, state);
		if (!gesture) {
			return;
		}
		gesture.element.setPointerCapture(event.pointerId);
		event.preventDefault();
	});
	dom.tracks.addEventListener('pointermove', (event) => {
		if (!gesture || gesture.pointerId !== event.pointerId) {
			return;
		}
		continueGesture(event, gesture, state);
		event.preventDefault();
	});
	const finish = (event) => {
		if (!gesture || gesture.pointerId !== event.pointerId) {
			return;
		}
		gesture = null;
		state.emit();
	};
	dom.tracks.addEventListener('pointerup', finish);
	dom.tracks.addEventListener('pointercancel', finish);
	dom.tracks.addEventListener('lostpointercapture', finish);
	dom.tracks.addEventListener('click', (event) => handleLaneTap(event, state));
}

function beginGesture(event, state) {
	const gestureNode = event.target.closest('[data-multitrack-gesture]');
	const element = event.target.closest('.multitrack-clip');
	const track = event.target.closest('.multitrack-track');
	if (!gestureNode || !element || !track) {
		return null;
	}
	const match = findMultitrackClip(state.project, element.dataset.clipId);
	if (!match) {
		return null;
	}
	state.selection.selectClip(track.dataset.trackId, match.clip.id);
	showImmediateSelection(element, state);
	return {
		pointerId: event.pointerId,
		mode: gestureNode.dataset.multitrackGesture,
		element,
		originX: event.clientX,
		originClip: { ...match.clip }
	};
}

function continueGesture(event, gesture, state) {
	const seconds = multitrackPixelsToSeconds(
		event.clientX - gesture.originX,
		state.selection.pixelsPerSecond
	);
	const clip = transformMultitrackGestureClip(gesture, seconds, state);
	state.project = replaceMultitrackClip(state.project, clip);
	renderMultitrackGestureClip(
		gesture.element,
		clip,
		state.selection.pixelsPerSecond
	);
}

function showImmediateSelection(element, state) {
	const previous = element.parentElement?.querySelector('.multitrack-clip-selected');
	previous?.classList.remove('multitrack-clip-selected');
	previous?.setAttribute('aria-selected', 'false');
	element.classList.add('multitrack-clip-selected');
	element.setAttribute('aria-selected', 'true');
}

function handleLaneTap(event, state) {
	if (event.target.closest('.multitrack-clip, .multitrack-track-header')) {
		return;
	}
	const lane = event.target.closest('.multitrack-lane');
	if (!lane) {
		return;
	}
	state.selection.selectTrack(lane.dataset.trackId);
	state.setPlayhead(multitrackPointerToLaneSeconds(
		event,
		lane,
		state.selection.pixelsPerSecond
	));
}
