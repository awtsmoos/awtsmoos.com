// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceTrackContract.js
 * @description Normalizes actor tracks and clips while preserving ordinary NLE edit fields.
 * The Awtsmoos places acted time inside editable measure without imprisoning it; Awtsmoos.com
 * keeps loop, blend, offset, speed, lock, mute, label, and take identity in cinematic rhyme.
 */

import {
	moviePerformanceBounded,
	moviePerformanceNonnegative,
	moviePerformanceNullableText,
	moviePerformanceText
} from './MoviePerformanceValue.js';

export function normalizeMoviePerformanceTrack(track, trackIndex = 0) {
	const id = moviePerformanceText(track?.id, `performance-${trackIndex + 1}`);
	return {
		...track,
		clips: Array.isArray(track?.clips)
			? track.clips.map((clip, index) => normalizeClip(clip, id, index))
			: [],
		color: moviePerformanceText(track?.color, '#c63d4f'),
		disabled: Boolean(track?.disabled),
		hidden: Boolean(track?.hidden),
		id,
		locked: Boolean(track?.locked),
		muted: Boolean(track?.muted),
		name: moviePerformanceText(track?.name, 'Character Performance'),
		solo: Boolean(track?.solo),
		target: moviePerformanceNullableText(track?.target),
		type: 'performance'
	};
}

function normalizeClip(clip = {}, trackId, index) {
	return {
		...clip,
		blendIn: moviePerformanceNonnegative(clip.blendIn),
		blendOut: moviePerformanceNonnegative(clip.blendOut),
		color: moviePerformanceText(clip.color, '#c63d4f'),
		duration: Math.max(0.001, moviePerformanceNonnegative(clip.duration, 0.001)),
		enabled: clip.enabled !== false,
		id: moviePerformanceText(clip.id, `${trackId}-clip-${index + 1}`),
		label: moviePerformanceText(clip.label, `Performance ${index + 1}`),
		locked: Boolean(clip.locked),
		loop: Boolean(clip.loop),
		muted: Boolean(clip.muted),
		offset: moviePerformanceNonnegative(clip.offset),
		reverse: Boolean(clip.reverse),
		speed: moviePerformanceBounded(clip.speed, 1, 0.01, 16),
		start: moviePerformanceNonnegative(clip.start),
		takeId: moviePerformanceText(clip.takeId)
	};
}
