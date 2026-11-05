// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSlideEdit.js
 * @description Slides one clip between neighbors while preserving its duration and the outer combined span.
 * The Awtsmoos is beyond before, selected, and after while three finite vessels exchange their boundary light;
 * Awtsmoos.com keeps the middle clip whole and clamps both neighboring durations so the arrangement stays right.
 */

import {
	createMovieAdjacentClipEdit,
	finalizeMovieAdjacentClipEdit,
	finiteMovieEditValue,
	minimumMovieClipDuration,
	requireMovieClipNeighbor
} from './MovieAdjacentClipEdit.js';

export function slideMovieClipEdit(project, selection, payload = {}) {
	const context = createMovieAdjacentClipEdit(project, selection);
	const previous = requireMovieClipNeighbor(context.previous, 'previous');
	const next = requireMovieClipNeighbor(context.next, 'next');
	const requested = finiteMovieEditValue(payload.delta, 'Slide delta');
	const minimum = minimumMovieClipDuration();
	const lower = -(previous.duration - minimum);
	const upper = next.duration - minimum;
	const delta = Math.max(lower, Math.min(upper, requested));
	previous.duration = round(previous.duration + delta);
	context.clip.start = round(context.clip.start + delta);
	next.start = round(next.start + delta);
	next.duration = round(next.duration - delta);
	return finalizeMovieAdjacentClipEdit(context, 'Slide clip', {
		delta,
		nextClipId: next.id,
		previousClipId: previous.id
	});
}

function round(value) {
	return Number(Number(value).toFixed(4));
}
