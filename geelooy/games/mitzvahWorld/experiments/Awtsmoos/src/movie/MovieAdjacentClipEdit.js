// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAdjacentClipEdit.js
 * @description Resolves one selected clip with sorted previous and next neighbors inside a cloned project.
 * The Awtsmoos is beyond adjacency while every finite trim must know the vessels touching its edge;
 * Awtsmoos.com keeps stable identities and returns one immutable editing context for each professional pledge.
 */

import { MovieApiError } from './MovieApiError.js';
import { resolveMovieSelection } from './MovieProjectSelection.js';
import { cloneMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieAdjacentClipEdit(project, selection) {
	const nextProject = cloneMovieProjectSnapshot(project);
	const resolved = resolveMovieSelection(nextProject, selection?.primary || selection);
	if (!resolved) {
		throw new MovieApiError(
			'MOVIE_CLIP_SELECTION_REQUIRED',
			'Select one clip for this timeline edit.'
		);
	}
	const clips = [...resolved.track.clips].sort(compareClips);
	const index = clips.findIndex(clip => clip.id === resolved.clip.id);
	return {
		clip: clips[index],
		clips,
		index,
		next: clips[index + 1] || null,
		previous: clips[index - 1] || null,
		project: nextProject,
		selection: {
			clipId: resolved.clip.id,
			trackId: resolved.track.id
		},
		track: resolved.track
	};
}

export function finalizeMovieAdjacentClipEdit(context, label, detail = {}) {
	context.track.clips = context.clips.sort(compareClips);
	return {
		detail: {
			...detail,
			clipId: context.clip.id,
			trackId: context.track.id
		},
		label,
		project: context.project,
		selection: context.selection
	};
}

export function requireMovieClipNeighbor(value, side) {
	if (value) return value;
	throw new MovieApiError(
		'MOVIE_CLIP_NEIGHBOR_REQUIRED',
		`This edit requires a ${side} neighboring clip.`
	);
}

export function finiteMovieEditValue(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		throw new MovieApiError('INVALID_MOVIE_EDIT_VALUE', `${label} must be finite.`);
	}
	return number;
}

export function minimumMovieClipDuration() {
	return 0.001;
}

function compareClips(left, right) {
	return Number(left.start || 0) - Number(right.start || 0)
		|| String(left.id).localeCompare(String(right.id));
}
