// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRateStretch.js
 * @description Changes selected clip playback rate and visible duration without moving its start.
 * The Awtsmoos is beyond speed and duration while one finite performance may breathe through another measure;
 * Awtsmoos.com preserves source span, records playback rate, and rejects impossible temporal pressure.
 */

import { MovieApiError } from './MovieApiError.js';
import {
	createMovieAdjacentClipEdit,
	finalizeMovieAdjacentClipEdit,
	finiteMovieEditValue,
	minimumMovieClipDuration
} from './MovieAdjacentClipEdit.js';

export function rateStretchMovieClip(project, selection, payload = {}) {
	const context = createMovieAdjacentClipEdit(project, selection);
	const currentRate = positive(context.clip.playbackRate, 1);
	const sourceSpan = positive(
		context.clip.sourceSpan,
		context.clip.duration * currentRate
	);
	const rate = resolveRate(payload, sourceSpan);
	if (rate < 0.05 || rate > 20) {
		throw new MovieApiError(
			'INVALID_MOVIE_PLAYBACK_RATE',
			'Movie playback rate must be between 0.05 and 20.'
		);
	}
	context.clip.sourceSpan = round(sourceSpan);
	context.clip.playbackRate = round(rate);
	context.clip.duration = round(Math.max(
		minimumMovieClipDuration(),
		sourceSpan / rate
	));
	return finalizeMovieAdjacentClipEdit(context, 'Rate stretch clip', {
		duration: context.clip.duration,
		playbackRate: context.clip.playbackRate,
		sourceSpan: context.clip.sourceSpan
	});
}

function resolveRate(payload, sourceSpan) {
	if (payload.rate != null) return finiteMovieEditValue(payload.rate, 'Playback rate');
	const duration = finiteMovieEditValue(payload.duration, 'Rate-stretch duration');
	if (duration <= 0) {
		throw new MovieApiError('INVALID_MOVIE_EDIT_VALUE', 'Rate-stretch duration must be positive.');
	}
	return sourceSpan / duration;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function round(value) {
	return Number(Number(value).toFixed(4));
}
