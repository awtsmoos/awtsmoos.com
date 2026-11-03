//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipActions
 * The Awtsmoos grants every sound a place and silence room to close;
 * Awtsmoos.com keeps the source intact as editing freely flows.
 */
import { duplicateMultitrackClip, moveMultitrackClip, splitMultitrackClip,
	trimMultitrackClipLeft, trimMultitrackClipRight } from './multitrackClipMath.js';
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { findMultitrackClip } from './multitrackProject.js';
import { rippleDeleteMultitrackClip } from './multitrackRippleDelete.js';
import { addMultitrackClip, replaceClipWithMany, replaceMultitrackClip } from './multitrackProjectEdits.js';

/** @param {Object} state - Editor. @returns {Object} Selected clip match. */
export function requireSelectedMultitrackClip(state) {
	const match = findMultitrackClip(state.project, state.selection.clipId);
	if (!match) throw new Error('Tap a clip first.');
	return match;
}

/** @param {Object} state - Editor. @param {number} start - New start. */
export function moveSelectedMultitrackClip(state, start) {
	const clip = moveMultitrackClip(requireSelectedMultitrackClip(state).clip, start, timing(state));
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

/** @param {Object} state - Editor. @param {number} start - New left edge. */
export function trimSelectedMultitrackClipLeft(state, start) {
	const clip = trimMultitrackClipLeft(requireSelectedMultitrackClip(state).clip, start, timing(state));
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

/** @param {Object} state - Editor. @param {number} end - Right edge. */
export function trimSelectedMultitrackClipRight(state, end) {
	const match = requireSelectedMultitrackClip(state);
	const sourceDuration = multitrackAudioStore.getBuffer(match.clip.bufferId)?.duration ?? Infinity;
	const clip = trimMultitrackClipRight(match.clip, end, timing(state), sourceDuration);
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

/** @param {Object} state - Editor. @returns {Object[]} Split clips. */
export function splitSelectedMultitrackClip(state) {
	const match = requireSelectedMultitrackClip(state);
	const clips = splitMultitrackClip(match.clip, state.selection.playheadSeconds);
	state.setProject(replaceClipWithMany(state.project, match.clip.id, clips));
	state.selectClip(match.track.id, clips[1].id);
	return clips;
}

/** @param {Object} state - Editor. @returns {Object} Copy. */
export function duplicateSelectedMultitrackClip(state) {
	const match = requireSelectedMultitrackClip(state);
	const copy = duplicateMultitrackClip(match.clip);
	state.setProject(addMultitrackClip(state.project, match.track.id, copy));
	state.selectClip(match.track.id, copy.id);
	return copy;
}

/** @param {Object} state - Editor. @returns {Object} Updated loop. */
export function toggleSelectedMultitrackLoop(state) {
	const match = requireSelectedMultitrackClip(state);
	const clip = { ...match.clip, loop: !match.clip.loop };
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

/** Deletes and closes the selected track's gap unless leave-gap mode is chosen.
 * @param {Object} state - Studio state.
 */
export function deleteSelectedMultitrackClip(state) {
	const match = requireSelectedMultitrackClip(state);
	state.setProject(rippleDeleteMultitrackClip(state.project, match.clip.id, state.rippleDelete !== false));
	state.selection.selectTrack(match.track.id);
	state.emit();
}

/** @param {Object} state - Studio. @returns {Object} Musical time grid. */
function timing(state) {
	return { tempo: state.project.tempo, gridBeats: state.selection.gridBeats };
}
