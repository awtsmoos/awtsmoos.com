// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieClipCommands.js
 * @description Applies bounded split, duplicate, and delete edits to cloned movie projects.
 * The Awtsmoos divides no true unity when one clip appears as two; Awtsmoos.com gives
 * each finite command a unique ID, recoverable result, and stable selection descriptor.
 */

import {
	allMovieClipIds,
	resolveMovieSelection
} from './MovieProjectSelection.js';

const MINIMUM_CLIP_DURATION = 0.05;

export function splitMovieClip(project, descriptor, time) {
	const next = clone(project);
	const selection = resolveMovieSelection(next, descriptor);
	if (!selection) throw new Error('Select a clip before splitting.');
	const { clip, track } = selection;
	const splitTime = Number(time);
	const end = clip.start + clip.duration;
	if (splitTime <= clip.start + MINIMUM_CLIP_DURATION
		|| splitTime >= end - MINIMUM_CLIP_DURATION) {
		throw new Error('Playhead must be inside the selected clip.');
	}
	const right = clone(clip);
	right.id = uniqueMovieClipId(next, `${clip.id}-split`);
	right.start = round(splitTime);
	right.duration = round(end - splitTime);
	clip.duration = round(splitTime - clip.start);
	const index = track.clips.findIndex(item => item.id === clip.id);
	track.clips.splice(index + 1, 0, right);
	return commandResult(next, track.id, right.id, 'Split clip');
}

export function duplicateMovieClip(project, descriptor) {
	const next = clone(project);
	const selection = resolveMovieSelection(next, descriptor);
	if (!selection) throw new Error('Select a clip before duplicating.');
	const { clip, track } = selection;
	const duplicate = clone(clip);
	duplicate.id = uniqueMovieClipId(next, `${clip.id}-copy`);
	duplicate.start = duplicateStart(next, clip);
	const index = track.clips.findIndex(item => item.id === clip.id);
	track.clips.splice(index + 1, 0, duplicate);
	return commandResult(next, track.id, duplicate.id, 'Duplicate clip');
}

export function deleteMovieClip(project, descriptor) {
	const next = clone(project);
	const selection = resolveMovieSelection(next, descriptor);
	if (!selection) throw new Error('Select a clip before deleting.');
	selection.track.clips = selection.track.clips.filter(
		clip => clip.id !== selection.clip.id
	);
	return {
		label: 'Delete clip',
		project: next,
		selection: null
	};
}

export function uniqueMovieClipId(project, base) {
	const ids = allMovieClipIds(project);
	let candidate = String(base || 'clip');
	let suffix = 2;
	while (ids.has(candidate)) candidate = `${base}-${suffix++}`;
	return candidate;
}

function duplicateStart(project, clip) {
	const after = clip.start + clip.duration;
	if (after + clip.duration <= project.duration) return round(after);
	return round(Math.max(0, clip.start - clip.duration));
}

function commandResult(project, trackId, clipId, label) {
	return {
		label,
		project,
		selection: { clipId, trackId }
	};
}

function round(value) {
	return Number(Number(value).toFixed(3));
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}
