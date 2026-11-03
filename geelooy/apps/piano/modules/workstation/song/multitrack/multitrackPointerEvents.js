//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPointerEvents
 * The Awtsmoos measures every finger by the sound beneath the hand;
 * Awtsmoos.com keeps seeking, moving and trimming in one truthful land.
 */
import { findMultitrackClip } from './multitrackProject.js';
import { replaceMultitrackClip } from './multitrackProjectEdits.js';
import { multitrackPixelsToSeconds, multitrackPointerToLaneSeconds } from './multitrackPointerMath.js';
import { transformMultitrackGestureClip } from './multitrackGestureTransform.js';
import { renderMultitrackGestureClip } from './multitrackRender.js';
import { seekMultitrackAudio } from './multitrackSeekTransport.js';
import { beginMultitrackGesture, updateMultitrackTouchGesture, finishMultitrackGesture } from './multitrackTouchGesture.js';

/** @param {Object} dom - Editor viewport. @param {Object} state - Source project. */
export function bindMultitrackPointerEvents(dom, state) {
	let gesture = null;
	dom.tracks.addEventListener('pointerdown', event => {
		if (gesture || (event.pointerType === 'mouse' && event.button !== 0)) return;
		gesture = beginClipPointer(event, state, dom);
		if (!gesture) return;
		gesture.element.setPointerCapture(event.pointerId);
		event.preventDefault();
	});
	dom.tracks.addEventListener('pointermove', event => {
		if (!gesture || gesture.pointerId !== event.pointerId) return;
		if (updateMultitrackTouchGesture(gesture, event)) moveClipPointer(event, gesture, state);
		event.preventDefault();
	});
	const finish = event => {
		if (!gesture || gesture.pointerId !== event.pointerId) return;
		const completed = gesture;
		gesture = null;
		finishMultitrackGesture(completed);
		if (event.type !== 'pointerup') {
			state.project = completed.before.project;
			restoreSelection(state, completed.before);
		} else if (completed.phase === 'pan') {
			restoreSelection(state, completed.before);
		} else if (completed.changed) {
			state.commitGesture(completed.before);
		} else if (completed.mode === 'move') {
			if (completed.wasSelected) state.selection.clearSelection();
			else state.selection.selectClip(completed.trackId, completed.originClip.id);
			const lane = completed.element.closest('.multitrack-lane');
			if (lane) void seekMultitrackAudio(dom, state, multitrackPointerToLaneSeconds(
				{ clientX: completed.originX }, lane, state.selection.pixelsPerSecond));
		}
		state.emit();
	};
	for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
		dom.tracks.addEventListener(name, finish);
	}
	dom.tracks.addEventListener('click', event => handleEmptySpace(event, state, dom));
	dom.viewport.addEventListener('click', event => {
		if (event.target.closest('.multitrack-clip,.multitrack-track-header,.multitrack-ruler')) return;
		if (event.target.closest('.multitrack-lane')) return;
		state.selection.clearSelection();
		state.emit();
	});
}

/** @param {PointerEvent} event - Finger down. @param {Object} state - Studio. @param {Object} dom - Viewport. */
function beginClipPointer(event, state, dom) {
	const node = event.target.closest('[data-multitrack-gesture]');
	const element = event.target.closest('.multitrack-clip');
	const track = event.target.closest('.multitrack-track');
	if (!node || !element || !track) return null;
	const match = findMultitrackClip(state.project, element.dataset.clipId);
	if (!match) return null;
	const before = state.snapshot();
	const wasSelected = before.clipId === match.clip.id;
	state.selection.selectClip(track.dataset.trackId, match.clip.id);
	showImmediateSelection(element);
	return beginMultitrackGesture(event, {
		mode: node.dataset.multitrackGesture, element, viewport: dom.viewport,
		originClip: { ...match.clip }, trackId: track.dataset.trackId,
		wasSelected, before
	});
}

/** @param {PointerEvent} event - Drag motion. @param {Object} gesture - Snapshot. @param {Object} state - Studio. */
function moveClipPointer(event, gesture, state) {
	const seconds = multitrackPixelsToSeconds(event.clientX - gesture.originX,
		state.selection.pixelsPerSecond);
	const clip = transformMultitrackGestureClip(gesture, seconds, state);
	state.project = replaceMultitrackClip(state.project, clip);
	renderMultitrackGestureClip(gesture.element, clip, state.selection.pixelsPerSecond);
}

/** @param {Object} state - Studio. @param {Object} frame - Selection snapshot. */
function restoreSelection(state, frame) {
	if (frame.clipId) state.selection.selectClip(frame.trackId, frame.clipId);
	else if (frame.trackId) state.selection.selectTrack(frame.trackId);
	else state.selection.clearSelection();
}

/** @param {HTMLElement} element - Clip, visually selected without rerender. */
function showImmediateSelection(element) {
	const previous = element.parentElement?.querySelector('.multitrack-clip-selected');
	previous?.classList.remove('multitrack-clip-selected');
	previous?.setAttribute('aria-selected', 'false');
	element.classList.add('multitrack-clip-selected');
	element.setAttribute('aria-selected', 'true');
}

/** @param {MouseEvent} event - Empty lane click. @param {Object} state - Studio. @param {Object} dom - Viewport. */
function handleEmptySpace(event, state, dom) {
	if (event.target.closest('.multitrack-clip,.multitrack-track-header')) return;
	const lane = event.target.closest('.multitrack-lane');
	if (!lane) return;
	state.selection.clearSelection();
	void seekMultitrackAudio(dom, state, multitrackPointerToLaneSeconds(
		event, lane, state.selection.pixelsPerSecond));
}
