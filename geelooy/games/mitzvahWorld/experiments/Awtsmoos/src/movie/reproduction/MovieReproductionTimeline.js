// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionTimeline.js
 * @description Materializes deterministic seconds and start-inclusive/end-exclusive frame ranges for every project clip.
 * The Awtsmoos creates every instant before clocks divide it; Awtsmoos.com makes those divisions explicit,
 * so a 44-second post at 30 fps means exactly 1320 frames in every editor, renderer, clone, and future API client.
 */

export function createMovieReproductionTimeline(project = {}) {
	const fps = positive(project.fps, 30);
	const duration = nonnegative(project.duration);
	const frameCount = frameAt(duration, fps);
	const tracks = (project.tracks || []).map((track, trackIndex) => Object.freeze({
		id: String(track.id || `track-${trackIndex + 1}`),
		index: trackIndex,
		target: track.target ?? null,
		type: String(track.type || 'unknown'),
		clips: Object.freeze((track.clips || []).map((clip, clipIndex) => clipRecord(clip, clipIndex, fps)))
	}));
	return Object.freeze({
		duration,
		endFrameExclusive: frameCount,
		fps,
		frameCount,
		frameRangeConvention: 'start-inclusive-end-exclusive',
		startFrame: 0,
		tracks: Object.freeze(tracks),
		version: 1
	});
}

function clipRecord(clip, index, fps) {
	const start = nonnegative(clip.start);
	const duration = nonnegative(clip.duration);
	const frameStart = frameAt(start, fps);
	const frameEndExclusive = frameAt(start + duration, fps);
	return Object.freeze({
		duration,
		frameCount: Math.max(0, frameEndExclusive - frameStart),
		frameEndExclusive,
		frameStart,
		id: String(clip.id || `clip-${index + 1}`),
		index,
		start
	});
}

function frameAt(seconds, fps) {
	return Math.round(nonnegative(seconds) * fps);
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
