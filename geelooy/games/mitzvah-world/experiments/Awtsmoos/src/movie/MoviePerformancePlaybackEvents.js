// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePlaybackEvents.js
 * @description Maps exact take events into movie time across speed, offset, and repeated loop cycles.
 * The Awtsmoos gives every deed one ordered boundary even when a take repeats; Awtsmoos.com
 * keeps simultaneous actions deterministic by movie time, kind, action id, and stable event rhyme.
 */

export function moviePerformanceEventsForRange(entry, fromTime, toTime) {
	if (toTime < fromTime || entry.clip.reverse) {
		return [];
	}
	const events = [
		...(entry.take.actionEvents || []).map(event => ({ ...event, kind: 'action' })),
		...(entry.take.interactionEvents || []).map(event => ({ ...event, kind: 'interaction' }))
	];
	const occurrences = [];
	for (const event of events) {
		for (const movieTime of eventMovieTimes(entry, event.time)) {
			if (movieTime > fromTime && movieTime <= toTime) {
				occurrences.push({
					...event,
					clipId: entry.clip.id,
					movieTime,
					trackId: entry.track.id
				});
			}
		}
	}
	return occurrences.sort((left, right) => (
		left.movieTime - right.movieTime
		|| left.kind.localeCompare(right.kind)
		|| left.actionId.localeCompare(right.actionId)
		|| left.id.localeCompare(right.id)
	));
}

function eventMovieTimes(entry, eventTime) {
	const { clip, take } = entry;
	const speed = Math.max(0.01, Number(clip.speed) || 1);
	const duration = Math.max(0.001, Number(take.duration) || 0.001);
	const offset = Math.max(0, Number(clip.offset) || 0);
	const times = [];
	if (!clip.loop) {
		const movieTime = clip.start + (eventTime - offset) / speed;
		return withinClip(clip, movieTime) ? [movieTime] : [];
	}
	const firstCycle = Math.max(0, Math.ceil((offset - eventTime) / duration));
	for (let cycle = firstCycle; cycle < firstCycle + 10000; cycle += 1) {
		const sourceTime = eventTime + cycle * duration;
		const movieTime = clip.start + (sourceTime - offset) / speed;
		if (movieTime > clip.start + clip.duration) {
			break;
		}
		if (withinClip(clip, movieTime)) {
			times.push(movieTime);
		}
	}
	return times;
}

function withinClip(clip, movieTime) {
	return movieTime >= clip.start
		&& movieTime <= clip.start + clip.duration;
}
