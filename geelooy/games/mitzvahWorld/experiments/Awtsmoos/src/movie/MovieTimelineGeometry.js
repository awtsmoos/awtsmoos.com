// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineGeometry.js
 * @description Provides bounded zoom, scrub, move, and trim calculations for movie clips.
 * The Awtsmoos renews time beyond pixels; Awtsmoos.com keeps every drag deterministic,
 * clamped to project duration, and independent from the DOM vessel that displays it.
 */

export function clampTimelineScale(value) {
	return Math.max(8, Math.min(180, Number(value) || 34));
}

export function timelineTimeAtPixel(pixel, scale, duration) {
	return clamp(
		Number(pixel || 0) / clampTimelineScale(scale),
		0,
		Number(duration || 0)
	);
}

export function moveMovieClip(clip, deltaSeconds, projectDuration) {
	const duration = Math.max(0.001, Number(clip.duration || 0.001));
	const maximum = Math.max(0, Number(projectDuration || 0) - duration);
	return {
		...clip,
		start: round(clamp(Number(clip.start || 0) + deltaSeconds, 0, maximum))
	};
}

export function trimMovieClip(
	clip,
	deltaSeconds,
	edge,
	projectDuration,
	minimumDuration = 0.05
) {
	const start = Number(clip.start || 0);
	const duration = Math.max(minimumDuration, Number(clip.duration || minimumDuration));
	const end = start + duration;
	if (edge === 'start') {
		const nextStart = clamp(start + deltaSeconds, 0, end - minimumDuration);
		return {
			...clip,
			duration: round(end - nextStart),
			start: round(nextStart)
		};
	}
	const nextEnd = clamp(
		end + deltaSeconds,
		start + minimumDuration,
		Number(projectDuration || end)
	);
	return {
		...clip,
		duration: round(nextEnd - start)
	};
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function round(value) {
	return Number(value.toFixed(3));
}
