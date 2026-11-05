// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRippleTrim.js
 * @description Trims a selected clip edge and shifts all following clips to close or open the changed span.
 * The Awtsmoos is beyond edge and sequence while one finite trim may move every later vessel in accord;
 * Awtsmoos.com keeps start nonnegative, duration positive, and the following timeline continuously restored.
 */

import { MovieApiError } from './MovieApiError.js';
import {
	createMovieAdjacentClipEdit,
	finalizeMovieAdjacentClipEdit,
	finiteMovieEditValue,
	minimumMovieClipDuration
} from './MovieAdjacentClipEdit.js';

export function rippleTrimMovieClip(project, selection, payload = {}) {
	const context = createMovieAdjacentClipEdit(project, selection);
	const edge = String(payload.edge || 'end');
	const requested = finiteMovieEditValue(payload.delta, 'Ripple trim delta');
	if (!['start', 'end'].includes(edge)) {
		throw new MovieApiError('UNKNOWN_MOVIE_TRIM_EDGE', `Unknown ripple trim edge ${edge}.`);
	}
	const delta = edge === 'start'
		? trimStart(context, requested)
		: trimEnd(context, requested);
	return finalizeMovieAdjacentClipEdit(context, 'Ripple trim clip', {
		delta,
		edge,
		shiftedClipIds: context.clips.slice(context.index + 1).map(clip => clip.id)
	});
}

function trimStart(context, requested) {
	const minimum = minimumMovieClipDuration();
	const lower = -context.clip.start;
	const upper = context.clip.duration - minimum;
	const delta = Math.max(lower, Math.min(upper, requested));
	context.clip.start = round(context.clip.start + delta);
	context.clip.duration = round(context.clip.duration - delta);
	context.clip.sourceOffset = round(Math.max(0, Number(context.clip.sourceOffset || 0) + delta));
	return delta;
}

function trimEnd(context, requested) {
	const minimum = minimumMovieClipDuration();
	const lower = -(context.clip.duration - minimum);
	const delta = Math.max(lower, requested);
	context.clip.duration = round(context.clip.duration + delta);
	for (const clip of context.clips.slice(context.index + 1)) {
		clip.start = round(Math.max(0, clip.start + delta));
	}
	return delta;
}

function round(value) {
	return Number(Number(value).toFixed(4));
}
