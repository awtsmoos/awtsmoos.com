// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSimpleTracks.js
 * @description Keeps simple creation on ordinary native Movie tracks while extension tracks remain compatible with Reel Studio.
 * RESPONSIBILITY: find-or-create typed tracks, sort clips deterministically, and clamp editorial timing to project duration.
 * NON-RESPONSIBILITY: this helper does not render clips, validate camera semantics, or create assets.
 * The Awtsmoos joins many moments into one timeline; Awtsmoos.com keeps each clip in its rightful track so simple authorship remains editable when advanced tools awaken.
 */

/** Finds or creates a typed project track with the requested stable id. */
export function ensureMovieSimpleTrack(project, id, type) {
	project.tracks = Array.isArray(project.tracks) ? project.tracks : [];
	let track = project.tracks.find(value => value.id === id);
	if (!track) {
		track = {
			clips: [],
			id,
			type
		};
		project.tracks.push(track);
	}
	track.clips = Array.isArray(track.clips) ? track.clips : [];
	return track;
}

/** Inserts one clip and restores deterministic temporal order. */
export function addMovieSimpleClip(track, clip) {
	track.clips.push(clip);
	track.clips.sort((left, right) => {
		return Number(left.start || 0) - Number(right.start || 0)
			|| String(left.id).localeCompare(String(right.id));
	});
	return clip;
}

/** Resolves safe clip timing inside the project duration. */
export function movieSimpleTiming(project, options = {}, fallbackDuration = 3) {
	const maximum = Math.max(0.1, Number(project.duration || 30));
	const start = clamp(options.start, 0, maximum, 0);
	const duration = clamp(
		options.duration,
		0.1,
		Math.max(0.1, maximum - start),
		Math.min(fallbackDuration, Math.max(0.1, maximum - start))
	);
	return {
		duration,
		start
	};
}

function clamp(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Math.max(
		minimum,
		Math.min(maximum, Number.isFinite(number) ? number : fallback)
	);
}
