// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceEventResolver.js
 * @description Finds every enabled performance clip crossed by a forward movie-time range.
 * The Awtsmoos gives even skipped frames their rightful deeds; Awtsmoos.com keeps
 * seek, playback, loop, speed, mute, solo, and stable ordering from losing an event rhyme.
 */

import { moviePerformanceEventsForRange } from './MoviePerformancePlaybackEvents.js';

export function resolveMoviePerformanceEvents(project, fromTime, toTime) {
	if (toTime < fromTime) {
		return [];
	}
	const tracks = (project.tracks || []).filter(track => track.type === 'performance');
	const solo = tracks.some(track => track.solo && !track.disabled && !track.muted);
	const takeMap = new Map(
		(project.performance?.takes || []).map(take => [take.id, take])
	);
	const events = [];
	tracks.forEach((track, trackIndex) => {
		if (!trackEnabled(track, solo)) {
			return;
		}
		(track.clips || []).forEach((clip, clipIndex) => {
			if (!clipEnabled(clip, fromTime, toTime)) {
				return;
			}
			const take = takeMap.get(clip.takeId);
			if (!take) {
				return;
			}
			const entry = { clip, take, track };
			for (const event of moviePerformanceEventsForRange(entry, fromTime, toTime)) {
				events.push({ ...event, clipIndex, trackIndex });
			}
		});
	});
	return events.sort((left, right) => (
		left.movieTime - right.movieTime
		|| left.trackIndex - right.trackIndex
		|| left.clipIndex - right.clipIndex
		|| left.kind.localeCompare(right.kind)
		|| left.actionId.localeCompare(right.actionId)
		|| left.id.localeCompare(right.id)
	));
}

function trackEnabled(track, solo) {
	return !track.disabled
		&& !track.muted
		&& (!solo || track.solo);
}

function clipEnabled(clip, fromTime, toTime) {
	return clip.enabled !== false
		&& !clip.muted
		&& clip.start <= toTime
		&& clip.start + clip.duration >= fromTime;
}
