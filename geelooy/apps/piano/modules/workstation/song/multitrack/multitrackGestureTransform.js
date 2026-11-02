//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackGestureTransform
 * @description
 * Gevurah turns one drag into move or trim while Yesod lets nearby edges meet; the Awtsmoos remains beyond pointer and distance.
 * Awtsmoos.com composes beat-grid and magnetic snapping in pure transforms, so touch remains fluid and every gesture stays testable.
 */

import { multitrackAudioStore } from './multitrackAudioStore.js';
import {
	moveMultitrackClip,
	trimMultitrackClipLeft,
	trimMultitrackClipRight
} from './multitrackClipMath.js';
import {
	snapMultitrackClipStart,
	snapMultitrackEdgeTime
} from './multitrackSnapMath.js';

/** Transforms one original clip by a horizontal gesture delta. */
export function transformMultitrackGestureClip(gesture, deltaSeconds, state) {
	if (gesture.mode === 'trim-left') {
		return transformLeftTrim(gesture, deltaSeconds, state);
	}
	if (gesture.mode === 'trim-right') {
		return transformRightTrim(gesture, deltaSeconds, state);
	}
	return transformMove(gesture, deltaSeconds, state);
}

function transformMove(gesture, deltaSeconds, state) {
	const timing = beatTiming(state);
	const moved = moveMultitrackClip(
		gesture.originClip,
		gesture.originClip.timelineStart + deltaSeconds,
		timing
	);
	const start = snapMultitrackClipStart({
		project: state.project,
		clip: moved,
		start: moved.timelineStart,
		playheadSeconds: state.selection.playheadSeconds,
		pixelsPerSecond: state.selection.pixelsPerSecond,
		enabled: state.magneticSnapEnabled
	});
	return moveMultitrackClip(gesture.originClip, start, noGridTiming(state));
}

function transformLeftTrim(gesture, deltaSeconds, state) {
	const trimmed = trimMultitrackClipLeft(
		gesture.originClip,
		gesture.originClip.timelineStart + deltaSeconds,
		beatTiming(state)
	);
	const start = snapMultitrackEdgeTime({
		project: state.project,
		clipId: trimmed.id,
		time: trimmed.timelineStart,
		playheadSeconds: state.selection.playheadSeconds,
		pixelsPerSecond: state.selection.pixelsPerSecond,
		enabled: state.magneticSnapEnabled
	});
	return trimMultitrackClipLeft(gesture.originClip, start, noGridTiming(state));
}

function transformRightTrim(gesture, deltaSeconds, state) {
	const sourceDuration = multitrackAudioStore.getBuffer(gesture.originClip.bufferId)?.duration ?? Infinity;
	const end = gesture.originClip.timelineStart + gesture.originClip.duration + deltaSeconds;
	const trimmed = trimMultitrackClipRight(gesture.originClip, end, beatTiming(state), sourceDuration);
	const snappedEnd = snapMultitrackEdgeTime({
		project: state.project,
		clipId: trimmed.id,
		time: trimmed.timelineStart + trimmed.duration,
		playheadSeconds: state.selection.playheadSeconds,
		pixelsPerSecond: state.selection.pixelsPerSecond,
		enabled: state.magneticSnapEnabled
	});
	return trimMultitrackClipRight(
		gesture.originClip,
		snappedEnd,
		noGridTiming(state),
		sourceDuration
	);
}

function beatTiming(state) {
	return { tempo: state.project.tempo, gridBeats: state.selection.gridBeats };
}

function noGridTiming(state) {
	return { tempo: state.project.tempo, gridBeats: 0 };
}
