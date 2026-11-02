//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPointerEvents
 * @description
 * Yesod gives mouse, pen, and one finger a clip-edit covenant while the Awtsmoos remains beyond pointer, trim, movement, and capture.
 * Awtsmoos.com restores a pending edit when a second finger claims pinch, so zoom never leaves a false drag or history shadow behind its rapture.
 */

import { restoreHistorySelection } from './multitrackHistory.js';
import { findMultitrackClip } from './multitrackProject.js';
import { replaceMultitrackClip } from './multitrackProjectEdits.js';
import { transformMultitrackGestureClip } from './multitrackGestureTransform.js';
import { renderMultitrackGestureClip } from './multitrackRender.js';
import { multitrackTouchSession } from './multitrackTouchSession.js';

/** Binds clip selection, move, and trim gestures without owning timeline seeking. */
export function bindMultitrackPointerEvents(dom, state) {
	let gesture = null;
	multitrackTouchSession.onPinch(() => cancelGesture());
	dom.tracks.addEventListener('pointerdown', (event) => {
		if (event.pointerType === 'touch' && multitrackTouchSession.hasActiveTouch()) {
			return;
		}
		gesture = beginGesture(event, state);
		if (!gesture) {
			return;
		}
		gesture.element.setPointerCapture(event.pointerId);
		event.preventDefault();
	});
	dom.tracks.addEventListener('pointermove', (event) => {
		if (gesture?.pointerId !== event.pointerId || multitrackTouchSession.isPinching()) {
			return;
		}
		continueGesture(event, gesture, state);
		event.preventDefault();
	});
	dom.tracks.addEventListener('pointerup', (event) => finishGesture(event, false));
	dom.tracks.addEventListener('pointercancel', (event) => finishGesture(event, true));

	function cancelGesture() {
		if (!gesture) {
			return;
		}
		state.project = gesture.originProject;
		restoreHistorySelection(state.selection, gesture.originSelection);
		gesture = null;
		state.emit();
	}

	function finishGesture(event, cancelled) {
		if (gesture?.pointerId !== event.pointerId) {
			return;
		}
		if (cancelled) {
			cancelGesture();
			return;
		}
		state.commitPreview(gesture.originProject, gesture.originSelection);
		gesture = null;
	}
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
	const originSelection = {
		trackId: state.selection.trackId,
		clipId: state.selection.clipId,
		playheadSeconds: state.selection.playheadSeconds
	};
	state.selection.selectClip(track.dataset.trackId, match.clip.id);
	showImmediateSelection(element);
	return {
		pointerId: event.pointerId,
		mode: gestureNode.dataset.multitrackGesture,
		element,
		originX: event.clientX,
		originClip: { ...match.clip },
		originProject: state.project,
		originSelection
	};
}

function continueGesture(event, gesture, state) {
	const deltaSeconds = (event.clientX - gesture.originX) / state.selection.pixelsPerSecond;
	const clip = transformMultitrackGestureClip(gesture, deltaSeconds, state);
	state.project = replaceMultitrackClip(state.project, clip);
	renderMultitrackGestureClip(gesture.element, clip, state.selection.pixelsPerSecond);
}

function showImmediateSelection(element) {
	const previous = element.parentElement?.querySelector('.multitrack-clip-selected');
	previous?.classList.remove('multitrack-clip-selected');
	previous?.setAttribute('aria-selected', 'false');
	element.classList.add('multitrack-clip-selected');
	element.setAttribute('aria-selected', 'true');
}
