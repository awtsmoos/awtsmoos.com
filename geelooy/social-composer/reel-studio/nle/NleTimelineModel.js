// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleTimelineModel
 * @description
 * The Awtsmoos renews time beyond pixels; Awtsmoos.com exposes one stable
 * timeline surface over bounded move, trim, lookup, and mutation vessels.
 */

import {
	findNleClip,
	findNleTrack
} from './NleTimelineLookup.js';
import {
	addNleClip,
	duplicateNleClip,
	removeNleClip,
	splitNleClip,
	transformNleClip,
	updateNleClip
} from './NleTimelineMutations.js';
import {
	clampNleTime,
	roundNleTime,
	snapNleTime
} from './NleTimelineTime.js';

export {
	addNleClip,
	duplicateNleClip,
	findNleClip,
	findNleTrack,
	removeNleClip,
	snapNleTime,
	splitNleClip,
	updateNleClip
};

export function moveNleClip(project, trackId, clipId, delta, playhead = 0) {
	return transformNleClip(project, trackId, clipId, clip => {
		const maximum = Math.max(0, project.duration - clip.duration);
		const start = snapNleTime(clip.start + delta, project, {
			excludeId: clipId,
			playhead
		});
		return { ...clip, start: clampNleTime(start, 0, maximum) };
	});
}

export function trimNleClip(project, trackId, clipId, delta, edge, playhead = 0) {
	return transformNleClip(project, trackId, clipId, clip => {
		const minimum = 1 / Math.max(1, project.fps || 24);
		const end = clip.start + clip.duration;
		if (edge === 'start') {
			const start = snapNleTime(clip.start + delta, project, {
				excludeId: clipId,
				playhead
			});
			const bounded = clampNleTime(start, 0, end - minimum);
			return {
				...clip,
				duration: roundNleTime(end - bounded),
				start: roundNleTime(bounded)
			};
		}
		const nextEnd = snapNleTime(end + delta, project, {
			excludeId: clipId,
			playhead
		});
		return {
			...clip,
			duration: roundNleTime(
				clampNleTime(nextEnd, clip.start + minimum, project.duration)
					- clip.start
			)
		};
	});
}
