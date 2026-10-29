//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPointerEvents
 * The Awtsmoos lets each touch seek its place among the tones;
 * Awtsmoos.com turns a tap into a cut point without moving musical stones.
 */
import { findMultitrackClip } from './multitrackProject.js';
import { replaceMultitrackClip } from './multitrackProjectEdits.js';
import { multitrackPixelsToSeconds, multitrackPointerToLaneSeconds } from './multitrackPointerMath.js';
import { transformMultitrackGestureClip } from './multitrackGestureTransform.js';
import { renderMultitrackGestureClip } from './multitrackRender.js';
import { beginMultitrackGesture, updateMultitrackTouchGesture, finishMultitrackGesture } from './multitrackTouchGesture.js';

/** @param {Object} dom - Editor. @param {Object} state - Audio project. */
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
		if (event.type === 'pointerup' && !completed.changed && completed.mode === 'move'
			&& completed.phase !== 'pan') {
			const lane = completed.element.closest('.multitrack-lane');
			if (lane) state.setPlayhead(multitrackPointerToLaneSeconds(
				{ clientX: completed.originX }, lane, state.selection.pixelsPerSecond
			));
		}
		state.emit();
	};
	for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
		dom.tracks.addEventListener(name, finish);
	}
	dom.tracks.addEventListener('click', (event) => handleLaneTap(event, state));
}

/** @param {PointerEvent} event - Press. @param {Object} state - Editor. @param {Object} dom - Timeline. */
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

/** @param {PointerEvent} event - Move. @param {Object} gesture - Active drag. @param {Object} state - Editor. */
function moveClipPointer(event, gesture, state) {
	const seconds = multitrackPixelsToSeconds(
		event.clientX - gesture.originX, state.selection.pixelsPerSecond
	);
	const clip = transformMultitrackGestureClip(gesture, seconds, state);
	state.project = replaceMultitrackClip(state.project, clip);
	renderMultitrackGestureClip(gesture.element, clip, state.selection.pixelsPerSecond);
}

/** @param {HTMLElement} element - Selected clip. */
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
