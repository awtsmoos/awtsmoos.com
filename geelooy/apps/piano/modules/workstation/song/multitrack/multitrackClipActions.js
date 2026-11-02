//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipActions
 * @description
 * Gevurah moves and cuts finite clip metadata while the Awtsmoos leaves every source buffer untouched and whole.
 * Awtsmoos.com lets Split, Trim, Move, Loop, Duplicate, and ripple-aware Delete become explicit edits that Undo can safely roll.
 */

import { multitrackAudioStore } from './multitrackAudioStore.js';
import {
	duplicateMultitrackClip,
	moveMultitrackClip,
	splitMultitrackClip,
	trimMultitrackClipLeft,
	trimMultitrackClipRight
} from './multitrackClipMath.js';
import { findMultitrackClip } from './multitrackProject.js';
import {
	addMultitrackClip,
	replaceClipWithMany,
	replaceMultitrackClip
} from './multitrackProjectEdits.js';
import { deleteMultitrackClipByPolicy } from './multitrackRipple.js';

export function requireSelectedMultitrackClip(state) {
	const match = findMultitrackClip(state.project, state.selection.clipId);
	if (!match) {
		throw new Error('Tap a clip first.');
	}
	return match;
}

export function moveSelectedMultitrackClip(state, start) {
	const match = requireSelectedMultitrackClip(state);
	const clip = moveMultitrackClip(match.clip, start, timing(state));
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

export function trimSelectedMultitrackClipLeft(state, start) {
	const match = requireSelectedMultitrackClip(state);
	const clip = trimMultitrackClipLeft(match.clip, start, timing(state));
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

export function trimSelectedMultitrackClipRight(state, end) {
	const match = requireSelectedMultitrackClip(state);
	const sourceDuration = multitrackAudioStore.getBuffer(match.clip.bufferId)?.duration ?? Infinity;
	const clip = trimMultitrackClipRight(match.clip, end, timing(state), sourceDuration);
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

export function splitSelectedMultitrackClip(state) {
	const match = requireSelectedMultitrackClip(state);
	const clips = splitMultitrackClip(match.clip, state.selection.playheadSeconds);
	state.setProject(replaceClipWithMany(state.project, match.clip.id, clips));
	state.selectClip(match.track.id, clips[1].id);
	return clips;
}

export function duplicateSelectedMultitrackClip(state) {
	const match = requireSelectedMultitrackClip(state);
	const copy = duplicateMultitrackClip(match.clip);
	state.setProject(addMultitrackClip(state.project, match.track.id, copy));
	state.selectClip(match.track.id, copy.id);
	return copy;
}

export function toggleSelectedMultitrackLoop(state) {
	const match = requireSelectedMultitrackClip(state);
	const clip = { ...match.clip, loop: !match.clip.loop };
	state.setProject(replaceMultitrackClip(state.project, clip));
	return clip;
}

export function deleteSelectedMultitrackClip(state) {
	const match = requireSelectedMultitrackClip(state);
	const project = deleteMultitrackClipByPolicy(
		state.project,
		match.clip.id,
		state.rippleDeleteEnabled
	);
	state.setProject(project);
	state.selection.selectTrack(match.track.id);
	state.emit();
}

function timing(state) {
	return {
		tempo: state.project.tempo,
		gridBeats: state.selection.gridBeats
	};
}
