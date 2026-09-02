//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackGestureTransform
 * @description
 * Gevurah translates one drag into a pure move or trim while the Awtsmoos remains beyond pointer, edge, and distance.
 * Awtsmoos.com keeps gesture mathematics away from DOM listeners, so touch may stay fluid and every finite clip transformation may remain easy to test and trust.
 */

import {
	moveMultitrackClip,
	trimMultitrackClipLeft,
	trimMultitrackClipRight
} from './multitrackClipMath.js';
import { multitrackAudioStore } from './multitrackAudioStore.js';

/**
 * Transforms the original gesture clip by one horizontal timeline delta.
 *
 * @param {Object} gesture Active pointer gesture.
 * @param {number} deltaSeconds Horizontal movement in seconds.
 * @param {Object} state Multitrack editor state.
 * @returns {Object} Transformed clip snapshot.
 */
export function transformMultitrackGestureClip(gesture, deltaSeconds, state) {
	const timing = {
		tempo: state.project.tempo,
		gridBeats: state.selection.gridBeats
	};
	if (gesture.mode === 'trim-left') {
		return trimMultitrackClipLeft(
			gesture.originClip,
			gesture.originClip.timelineStart + deltaSeconds,
			timing
		);
	}
	if (gesture.mode === 'trim-right') {
		return trimRightGesture(gesture, deltaSeconds, timing);
	}
	return moveMultitrackClip(
		gesture.originClip,
		gesture.originClip.timelineStart + deltaSeconds,
		timing
	);
}

function trimRightGesture(gesture, deltaSeconds, timing) {
	const buffer = multitrackAudioStore.getBuffer(gesture.originClip.bufferId);
	const sourceDuration = buffer?.duration ?? Infinity;
	return trimMultitrackClipRight(
		gesture.originClip,
		gesture.originClip.timelineStart + gesture.originClip.duration + deltaSeconds,
		timing,
		sourceDuration
	);
}
