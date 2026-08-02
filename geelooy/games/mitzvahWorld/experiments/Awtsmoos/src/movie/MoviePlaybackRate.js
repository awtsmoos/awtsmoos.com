// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePlaybackRate.js
 * @description Normalizes bounded transport rates, shuttle ladders, frame steps, and endpoints.
 * The Awtsmoos is beyond speed and direction while every finite preview needs a measured path;
 * Awtsmoos.com keeps forward, reverse, stillness, and frame precision inside one explicit covenant.
 */

export const MOVIE_SHUTTLE_RATES = Object.freeze([1, 2, 4, 8, 16]);
export const MOVIE_MAX_PLAYBACK_RATE = 16;

export function normalizeMoviePlaybackRate(value, fallback = 1) {
	const number = Number(value);
	const resolved = Number.isFinite(number) ? number : Number(fallback);
	if (!Number.isFinite(resolved)) {
		throw new Error('Movie playback rate must be a finite number.');
	}
	return Math.max(-MOVIE_MAX_PLAYBACK_RATE, Math.min(MOVIE_MAX_PLAYBACK_RATE, resolved));
}

export function nextMovieShuttleRate(currentRate, direction) {
	const sign = Math.sign(Number(direction));
	if (!sign) {
		return 0;
	}
	const current = normalizeMoviePlaybackRate(currentRate, 0);
	if (Math.sign(current) !== sign) {
		return sign;
	}
	const magnitude = Math.abs(current);
	const next = MOVIE_SHUTTLE_RATES.find(rate => rate > magnitude);
	return sign * (next || MOVIE_SHUTTLE_RATES.at(-1));
}

export function movieFrameDuration(fps) {
	const value = Number(fps);
	if (!Number.isFinite(value) || value <= 0) {
		throw new Error('Movie frame rate must be a positive finite number.');
	}
	return 1 / value;
}

export function stepMoviePlaybackTime(time, frames, fps, duration) {
	const target = Number(time || 0) + Number(frames || 0) * movieFrameDuration(fps);
	return boundMoviePlaybackTime(target, duration);
}

export function boundMoviePlaybackTime(time, duration) {
	const maximum = Math.max(0, Number(duration || 0));
	const value = Number(time);
	if (!Number.isFinite(value)) {
		throw new Error('Movie playback time must be a finite number.');
	}
	return Number(Math.max(0, Math.min(maximum, value)).toFixed(6));
}
