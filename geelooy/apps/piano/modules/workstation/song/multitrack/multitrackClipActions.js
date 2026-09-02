//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipActions
 * @description
 * Gevurah gives selected audio a clean knife and movable boundary while the Awtsmoos leaves the underlying source untouched and whole.
 * Awtsmoos.com lets Split, Trim, Move, Loop, Duplicate, and Delete become reversible metadata gestures whose finite forms can grow.
 */

import {
	duplicateMultitrackClip,
	moveMultitrackClip,
	splitMultitrackClip,
	trimMultitrackClipLeft,
	trimMultitrackClipRight
} from './multitrackClipMath.js';
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { findMultitrackClip } from './multitrackProject.js';
import {
	addMultitrackClip,
	removeMultitrackClip,
	replaceClipWithMany,
	replaceMultitrackClip
} from './multitrackProjectEdits.js';

/** Returns currently selected clip match or throws one useful editor error. @param {Object} state Editor state. @returns {Object} Track/clip match. */
export function requireSelectedMultitrackClip(state) {
	const match = findMultitrackClip(state.project, state.selection.clipId);
	if (!match) {
		throw new Error('Tap a clip first.');
	}
	return match;
}

/** Moves selected clip. @param {Object} state Editor state. @param {number} start Timeline start. @returns {Object} Moved clip. */
export function moveSelectedMultitrackClip(state, start) {
	const match = requireSelectedMultitrackClip(state);
	const clip = moveMultitrackClip(match.clip, start, timing(state));
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

/** Trims selected left edge. @param {Object} state Editor state. @param {number} start Timeline start. @returns {Object} Trimmed clip. */
export function trimSelectedMultitrackClipLeft(state, start) {
	const match = requireSelectedMultitrackClip(state);
	const clip = trimMultitrackClipLeft(match.clip, start, timing(state));
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

/** Trims selected right edge. @param {Object} state Editor state. @param {number} end Timeline end. @returns {Object} Trimmed clip. */
export function trimSelectedMultitrackClipRight(state, end) {
	const match = requireSelectedMultitrackClip(state);
	const sourceDuration = multitrackAudioStore.getBuffer(match.clip.bufferId)?.duration ?? Infinity;
	const clip = trimMultitrackClipRight(match.clip, end, timing(state), sourceDuration);
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

/** Splits selected clip at playhead. @param {Object} state Editor state. @returns {Object[]} Split clips. */
export function splitSelectedMultitrackClip(state) {
	const match = requireSelectedMultitrackClip(state);
	const clips = splitMultitrackClip(match.clip, state.selection.playheadSeconds);
	state.setProject(replaceClipWithMany(state.project, match.clip.id, clips));
	state.selectClip(match.track.id, clips[1].id);
	return clips;
}

/** Duplicates selected clip after itself. @param {Object} state Editor state. @returns {Object} Duplicate. */
export function duplicateSelectedMultitrackClip(state) {
	const match = requireSelectedMultitrackClip(state);
	const copy = duplicateMultitrackClip(match.clip);
	state.setProject(addMultitrackClip(state.project, match.track.id, copy));
	state.selectClip(match.track.id, copy.id);
	return copy;
}

/** Toggles selected clip looping. @param {Object} state Editor state. @returns {Object} Updated clip. */
export function toggleSelectedMultitrackLoop(state) {
	const match = requireSelectedMultitrackClip(state);
	const clip = { ...match.clip, loop: !match.clip.loop };
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

/** Deletes selected clip explicitly. @param {Object} state Editor state. @returns {void} */
export function deleteSelectedMultitrackClip(state) {
	const match = requireSelectedMultitrackClip(state);
	state.setProject(removeMultitrackClip(state.project, match.clip.id));
	state.selection.selectTrack(match.track.id);
	state.emit();
}

function timing(state) {
	return {
		tempo: state.project.tempo,
		gridBeats: state.selection.gridBeats
	};
}
