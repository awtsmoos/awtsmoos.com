//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackSnapMath
 * @description
 * Yesod lets nearby edges recognize one another while the Awtsmoos remains beyond distance and attachment.
 * Awtsmoos.com keeps magnetic strength measured in screen pixels, so zoom changes never make the same finger feel stronger or weaker.
 */

const DEFAULT_THRESHOLD_PIXELS = 8;

/** Snaps a moving clip start or end to nearby timeline landmarks. */
export function snapMultitrackClipStart(options) {
	const {
		project,
		clip,
		start,
		playheadSeconds = 0,
		pixelsPerSecond = 72,
		enabled = true,
		thresholdPixels = DEFAULT_THRESHOLD_PIXELS
	} = options;
	if (!enabled || !clip || pixelsPerSecond <= 0) {
		return Math.max(0, start);
	}
	const threshold = thresholdPixels / pixelsPerSecond;
	const targets = collectMagneticTargets(project, clip.id, playheadSeconds);
	const edges = [
		{ time: start, offset: 0 },
		{ time: start + clip.duration, offset: clip.duration }
	];
	let best = { distance: Infinity, start };
	for (const edge of edges) {
		for (const target of targets) {
			const distance = Math.abs(target - edge.time);
			if (distance <= threshold && distance < best.distance) {
				best = {
					distance,
					start: target - edge.offset
				};
			}
		}
	}
	return Math.max(0, best.start);
}

/** Snaps one trim edge to nearby clip boundaries, zero, or the playhead. */
export function snapMultitrackEdgeTime(options) {
	const {
		project,
		clipId,
		time,
		playheadSeconds = 0,
		pixelsPerSecond = 72,
		enabled = true,
		thresholdPixels = DEFAULT_THRESHOLD_PIXELS
	} = options;
	if (!enabled || pixelsPerSecond <= 0) {
		return Math.max(0, time);
	}
	const threshold = thresholdPixels / pixelsPerSecond;
	const targets = collectMagneticTargets(project, clipId, playheadSeconds);
	let best = { distance: Infinity, time };
	for (const target of targets) {
		const distance = Math.abs(target - time);
		if (distance <= threshold && distance < best.distance) {
			best = { distance, time: target };
		}
	}
	return Math.max(0, best.time);
}

/** Collects stable timeline landmarks while excluding the actively edited clip. */
export function collectMagneticTargets(project, clipId, playheadSeconds = 0) {
	const targets = [0, Math.max(0, Number(playheadSeconds) || 0)];
	project?.tracks?.forEach((track) => {
		track.clips.forEach((clip) => {
			if (clip.id === clipId) {
				return;
			}
			targets.push(clip.timelineStart);
			targets.push(clip.timelineStart + clip.duration);
		});
	});
	return targets;
}
