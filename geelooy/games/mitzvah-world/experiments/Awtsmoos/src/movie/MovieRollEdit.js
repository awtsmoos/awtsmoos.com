// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRollEdit.js
 * @description Rolls the boundary between a selected clip and its next neighbor without changing combined span.
 * The Awtsmoos is beyond left and right while one finite boundary may move without moving the whole;
 * Awtsmoos.com preserves total duration and clamps both neighboring vessels above the minimum soul.
 */

import {
	createMovieAdjacentClipEdit,
	finalizeMovieAdjacentClipEdit,
	finiteMovieEditValue,
	minimumMovieClipDuration,
	requireMovieClipNeighbor
} from './MovieAdjacentClipEdit.js';

export function rollMovieClipEdit(project, selection, payload = {}) {
	const context = createMovieAdjacentClipEdit(project, selection);
	const right = requireMovieClipNeighbor(context.next, 'next');
	const requested = finiteMovieEditValue(payload.delta, 'Roll delta');
	const minimum = minimumMovieClipDuration();
	const lower = -(context.clip.duration - minimum);
	const upper = right.duration - minimum;
	const delta = Math.max(lower, Math.min(upper, requested));
	context.clip.duration = round(context.clip.duration + delta);
	right.start = round(right.start + delta);
	right.duration = round(right.duration - delta);
	return finalizeMovieAdjacentClipEdit(context, 'Roll clip boundary', {
		delta,
		nextClipId: right.id
	});
}

function round(value) {
	return Number(Number(value).toFixed(4));
}
