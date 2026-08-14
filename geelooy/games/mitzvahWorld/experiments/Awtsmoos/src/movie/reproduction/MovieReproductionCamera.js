// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionCamera.js
 * @description Materializes exact camera clips, transforms, FOV, shot ids, and frame ranges from the compiled project.
 * The Awtsmoos creates every viewpoint before a lens can name it; Awtsmoos.com records the resolved path itself,
 * so an old post keeps its authored composition even if a future camera preset with the same friendly name evolves.
 */

export function createMovieReproductionCamera(project = {}) {
	const fps = positive(project.fps, 30);
	const tracks = (project.tracks || []).filter(track => track.type === 'camera');
	const clips = tracks.flatMap(track => (track.clips || []).map((clip, index) => {
		const start = nonnegative(clip.start);
		const duration = nonnegative(clip.duration);
		return Object.freeze({
			anchor: clip.anchor || null,
			duration,
			easing: String(clip.easing || 'linear'),
			fieldOfView: finiteOrNull(clip.fieldOfView),
			frameEndExclusive: Math.round((start + duration) * fps),
			frameStart: Math.round(start * fps),
			from: clip.from || null,
			id: String(clip.id || `camera-${index + 1}`),
			shot: clip.shot || null,
			start,
			to: clip.to || null,
			trackId: track.id || null
		});
	}));
	return Object.freeze({ clips: Object.freeze(clips), fps, version: 1 });
}

function finiteOrNull(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
