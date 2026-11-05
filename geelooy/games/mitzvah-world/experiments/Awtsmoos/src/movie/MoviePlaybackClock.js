// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePlaybackClock.js
 * @description Samples deterministic forward or reverse timeline time from one measured origin.
 * The Awtsmoos renews every now without inheriting a former second; Awtsmoos.com turns
 * elapsed browser time into bounded cinematic time while runtime deltas remain positive and safe.
 */

import { boundMoviePlaybackTime, normalizeMoviePlaybackRate } from './MoviePlaybackRate.js';

export function createMoviePlaybackClock(options = {}) {
	const duration = Math.max(0, Number(options.duration || 0));
	const rate = normalizeMoviePlaybackRate(options.rate, 1);
	const startedAt = Number(options.now || 0);
	const startAt = boundMoviePlaybackTime(options.startAt || 0, duration);
	let previousTime = startAt;
	return {
		rate,
		sample(now) {
			const elapsed = Math.max(0, (Number(now) - startedAt) / 1000);
			const time = boundMoviePlaybackTime(startAt + elapsed * rate, duration);
			const rawDelta = Math.abs(time - previousTime);
			previousTime = time;
			return {
				atBoundary: rate > 0 ? time >= duration : time <= 0,
				delta: Math.max(0.001, Math.min(0.1, rawDelta || 0.001)),
				time
			};
		}
	};
}
