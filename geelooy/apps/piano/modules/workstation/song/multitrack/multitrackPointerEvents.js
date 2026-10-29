//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPointerEvents
 * The Awtsmoos receives both the mouse and the finger as one gift;
 * Awtsmoos.com lets a tap select, a swipe pan, and a hold drag or trim.
 */
import { findMultitrackClip } from './multitrackProject.js';
import { replaceMultitrackClip } from './multitrackProjectEdits.js';
import { multitrackPixelsToSeconds, multitrackPointerToLaneSeconds } from './multitrackPointerMath.js';
import { transformMultitrackGestureClip } from './multitrackGestureTransform.js';
import { renderMultitrackGestureClip } from './multitrackRender.js';
import {
	beginMultitrackGesture,
	updateMultitrackTouchGesture,
	finishMultitrackGesture
} from './multitrackTouchGesture.js';

/** @param {Object} dom - Editor DOM. @param {Object} state - Project state. */
export function bindMultitrackPointerEvents(dom, state) {
	let gesture = null;
	dom.tracks.addEventListener('pointerdown', (event) => {
		if (gesture || (event.pointerType === 'mouse' && event.button !== 0)) return;
		gesture = beginClipPointer(event, state, dom);
		if (!gesture) return;
		gesture.element.setPointerCapture(event.pointerId);
		event.preventDefault();
	});
	dom.tracks.addEventListener('pointermove', (event) => {
		if (!gesture || gesture.pointerId !== event.pointerId) return;
		if (updateMultitrackTouchGesture(gesture, event)) {
			moveClipPointer(event, gesture, state);
		}
		event.preventDefault();
	});
	const finish = (event) => {
		if (!gesture || gesture.pointerId !== event.pointerId) return;
		const completed = gesture;
		gesture = null;
		finishMultitrackGesture(completed);
		state.emit();
	};
	for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
		dom.tracks.addEventListener(name, finish);
	}
	dom.tracks.addEventListener('click', (event) => handleLaneTap(event, state));
}

/** @param {PointerEvent} event - Press. @param {Object} state - Editor. @param {Object} dom - Visible timeline. */
function beginClipPointer(event, state, dom) {
	const gestureNode = event.target.closest('[data-multitrack-gesture]');
	const element = event.target.closest('.multitrack-clip');
	const track = event.target.closest('.multitrack-track');
	if (!gestureNode || !element || !track) return null;
	const match = findMultitrackClip(state.project, element.dataset.clipId);
	if (!match) return null;
	state.selection.selectClip(track.dataset.trackId, match.clip.id);
	showImmediateSelection(element);
	return beginMultitrackGesture(event, {
		mode: gestureNode.dataset.multitrackGesture,
		element,
		viewport: dom.viewport,
		originClip: { ...match.clip }
	});
}

/** @param {PointerEvent} event - Move. @param {Object} gesture - Active gesture. @param {Object} state - Editor. */
function moveClipPointer(event, gesture, state) {
	const seconds = multitrackPixelsToSeconds(
		event.clientX - gesture.originX,
		state.selection.pixelsPerSecond
	);
	const clip = transformMultitrackGestureClip(gesture, seconds, state);
	state.project = replaceMultitrackClip(state.project, clip);
	renderMultitrackGestureClip(gesture.element, clip, state.selection.pixelsPerSecond);
}

/** @param {HTMLElement} element - Newly selected clip. */
function showImmediateSelection(element) {
	const previous = element.parentElement?.querySelector('.multitrack-clip-selected');
	previous?.classList.remove('multitrack-clip-selected');
	previous?.setAttribute('aria-selected', 'false');
	element.classList.add('multitrack-clip-selected');
	element.setAttribute('aria-selected', 'true');
}

/** @param {PointerEvent} event - Empty lane tap. @param {Object} state - Editor. */
function handleLaneTap(event, state) {
	if (event.target.closest('.multitrack-clip,.multitrack-track-header')) return;
	const lane = event.target.closest('.multitrack-lane');
	if (!lane) return;
	state.selection.selectTrack(lane.dataset.trackId);
	state.setPlayhead(multitrackPointerToLaneSeconds(event, lane, state.selection.pixelsPerSecond));
}
