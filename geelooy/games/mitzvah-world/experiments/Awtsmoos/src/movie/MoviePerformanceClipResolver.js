// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceClipResolver.js
 * @description Resolves enabled, unmuted, solo-aware performance clips into deterministic source time.
 * The Awtsmoos joins movie time and acted time without confusing their measures; Awtsmoos.com
 * keeps offset, speed, loop, reverse, blend, track order, and performer identity in editable rhyme.
 */

export function resolveMoviePerformanceClips(project, time) {
	const tracks = (project.tracks || []).filter(track => track.type === 'performance');
	const solo = tracks.some(track => track.solo && !track.disabled && !track.muted);
	const takeMap = new Map(
		(project.performance?.takes || []).map(take => [take.id, take])
	);
	const entries = [];
	tracks.forEach((track, trackIndex) => {
		if (!trackEnabled(track, solo)) {
			return;
		}
		(track.clips || []).forEach((clip, clipIndex) => {
			const take = takeMap.get(clip.takeId);
			if (take && clipActive(clip, time)) {
				entries.push({
					clip,
					clipIndex,
					localTime: moviePerformanceClipLocalTime(clip, take, time),
					order: trackIndex * 100000 + clipIndex,
					take,
					track,
					trackIndex,
					weight: moviePerformanceClipWeight(clip, time)
				});
			}
		});
	});
	return entries.sort((left, right) => (
		left.order - right.order || left.clip.id.localeCompare(right.clip.id)
	));
}

export function moviePerformanceClipLocalTime(clip, take, movieTime) {
	const elapsed = Math.max(0, movieTime - clip.start);
	const speed = Math.max(0.01, Number(clip.speed) || 1);
	const duration = Math.max(0.001, Number(take.duration) || 0.001);
	let source = Math.max(0, Number(clip.offset) || 0) + elapsed * speed;
	if (clip.loop) {
		source %= duration;
	} else {
		source = Math.min(duration, source);
	}
	return clip.reverse ? duration - source : source;
}

export function moviePerformanceClipWeight(clip, movieTime) {
	const elapsed = Math.max(0, movieTime - clip.start);
	const remaining = Math.max(0, clip.start + clip.duration - movieTime);
	const blendIn = Math.max(0, Number(clip.blendIn) || 0);
	const blendOut = Math.max(0, Number(clip.blendOut) || 0);
	const incoming = blendIn ? Math.min(1, elapsed / blendIn) : 1;
	const outgoing = blendOut ? Math.min(1, remaining / blendOut) : 1;
	return Math.max(0, Math.min(incoming, outgoing));
}

function trackEnabled(track, solo) {
	return !track.disabled
		&& !track.muted
		&& (!solo || track.solo);
}

function clipActive(clip, time) {
	return clip.enabled !== false
		&& !clip.muted
		&& time >= clip.start
		&& time <= clip.start + clip.duration;
}
