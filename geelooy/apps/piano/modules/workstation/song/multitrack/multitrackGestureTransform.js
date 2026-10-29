//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackGestureTransform
 * The Awtsmoos guides each hand toward its neighboring note;
 * Awtsmoos.com lets a clip snap home while source waves float.
 */
import { moveMultitrackClip, trimMultitrackClipLeft, trimMultitrackClipRight } from './multitrackClipMath.js';
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { snapMultitrackClipToNeighbors } from './multitrackMagneticSnap.js';

/** Turns the original clip and pointer delta into non-destructive metadata.
 * @param {Object} gesture - Active pointer state.
 * @param {number} deltaSeconds - Horizontal motion.
 * @param {Object} state - Studio state.
 * @returns {Object} Clip preview with optional magnetism.
 */
export function transformMultitrackGestureClip(gesture, deltaSeconds, state) {
	const timing = { tempo: state.project.tempo, gridBeats: state.selection.gridBeats };
	const original = gesture.originClip;
	let clip;
	if (gesture.mode === 'trim-left') {
		clip = trimMultitrackClipLeft(original, original.timelineStart + deltaSeconds, timing);
	} else if (gesture.mode === 'trim-right') {
		const source = multitrackAudioStore.getBuffer(original.bufferId);
		clip = trimMultitrackClipRight(original,
			original.timelineStart + original.duration + deltaSeconds,
			timing, source?.duration ?? Infinity);
	} else {
		clip = moveMultitrackClip(original, original.timelineStart + deltaSeconds, timing);
	}
	if (!state.selection.gridBeats) return clip;
	const track = state.project.tracks.find(item => item.clips.some(candidate => candidate.id === original.id));
	const result = snapMultitrackClipToNeighbors(clip, track, gesture.mode,
		state.selection.pixelsPerSecond);
	if (gesture.mode === 'trim-right') {
		const source = multitrackAudioStore.getBuffer(original.bufferId);
		if (source && !original.loop && result.duration + result.sourceOffset > source.duration) return clip;
	}
	return result;
}
