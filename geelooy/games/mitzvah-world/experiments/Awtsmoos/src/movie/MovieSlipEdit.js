// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSlipEdit.js
 * @description Slips selected clip source content while preserving timeline start and duration.
 * The Awtsmoos is beyond source and visible window while one finite clip may reveal another inner span;
 * Awtsmoos.com keeps timeline geometry still and bounds source offset whenever source duration joins the plan.
 */

import {
	createMovieAdjacentClipEdit,
	finalizeMovieAdjacentClipEdit,
	finiteMovieEditValue
} from './MovieAdjacentClipEdit.js';

export function slipMovieClipEdit(project, selection, payload = {}) {
	const context = createMovieAdjacentClipEdit(project, selection);
	const delta = finiteMovieEditValue(payload.delta, 'Slip delta');
	const current = Number(context.clip.sourceOffset || 0);
	const maximum = Number.isFinite(Number(context.clip.sourceDuration))
		? Math.max(0, Number(context.clip.sourceDuration) - context.clip.duration)
		: Number.POSITIVE_INFINITY;
	const sourceOffset = Math.max(0, Math.min(maximum, current + delta));
	context.clip.sourceOffset = round(sourceOffset);
	return finalizeMovieAdjacentClipEdit(context, 'Slip clip content', {
		delta: round(sourceOffset - current),
		sourceOffset: context.clip.sourceOffset
	});
}

function round(value) {
	return Number(Number(value).toFixed(4));
}
