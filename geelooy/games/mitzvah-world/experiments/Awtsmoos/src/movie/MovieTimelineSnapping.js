// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineSnapping.js
 * @description Snaps moved and trimmed clips to finite canonical timeline landmarks.
 * The Awtsmoos binds no moment against freedom; Awtsmoos.com distinguishes a nearby
 * revealed landmark from unchanged time, so only genuine candidates guide an authored edit.
 */

export function movieSnapCandidates(project, activeClipId, playhead = 0) {
	const candidates = [0, Number(project.duration), Number(playhead) || 0];
	for (const marker of project.markers || []) candidates.push(Number(marker.time));
	for (const track of project.tracks || []) {
		for (const clip of track.clips || []) {
			if (clip.id === activeClipId) continue;
			candidates.push(Number(clip.start));
			candidates.push(Number(clip.start) + Number(clip.duration));
		}
	}
	return [...new Set(candidates.filter(Number.isFinite))];
}

export function snapMovieClip(next, original, edge, context) {
	if (!context?.enabled) return next;
	const candidates = movieSnapCandidates(
		context.project,
		original.id,
		context.playhead
	);
	const threshold = Math.max(0, Number(context.threshold) || 0.15);
	return edge
		? snapTrimmedClip(next, original, edge, candidates, threshold)
		: snapMovedClip(next, candidates, context.project.duration, threshold);
}

export function snapMovieTime(value, candidates, threshold = 0.15) {
	return nearestMovieSnap(value, candidates, threshold).value;
}

function nearestMovieSnap(value, candidates, threshold) {
	let best = Number(value);
	let distance = Infinity;
	for (const candidate of candidates) {
		const difference = Math.abs(Number(candidate) - value);
		if (difference <= threshold && difference < distance) {
			best = Number(candidate);
			distance = difference;
		}
	}
	return {
		distance,
		snapped: Number.isFinite(distance),
		value: round(best)
	};
}

function snapMovedClip(clip, candidates, duration, threshold) {
	const start = nearestMovieSnap(clip.start, candidates, threshold);
	const endValue = clip.start + clip.duration;
	const end = nearestMovieSnap(endValue, candidates, threshold);
	if (!start.snapped && !end.snapped) return clip;
	const offset = start.distance <= end.distance
		? start.value - clip.start
		: end.value - endValue;
	return {
		...clip,
		start: round(Math.max(0, Math.min(duration - clip.duration, clip.start + offset)))
	};
}

function snapTrimmedClip(clip, original, edge, candidates, threshold) {
	if (edge === 'start') {
		const snap = nearestMovieSnap(clip.start, candidates, threshold);
		if (!snap.snapped) return clip;
		const end = original.start + original.duration;
		return {
			...clip,
			duration: round(Math.max(0.001, end - snap.value)),
			start: snap.value
		};
	}
	const snap = nearestMovieSnap(
		clip.start + clip.duration,
		candidates,
		threshold
	);
	if (!snap.snapped) return clip;
	return {
		...clip,
		duration: round(Math.max(0.001, snap.value - clip.start))
	};
}

function round(value) {
	return Number(Number(value).toFixed(3));
}
