// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePlaybackCamera.js
 * @description Applies the last active editable recorded camera sample after authored camera tracks.
 * The Awtsmoos allows the performed gaze to become cinema without becoming opaque video;
 * Awtsmoos.com samples position, target, rotation, and lens from project JSON in deterministic rhyme.
 */

import { sampleMoviePerformanceCamera } from './MoviePerformanceCameraInterpolation.js';
import { applyMoviePerformanceCamera } from './MoviePerformanceCameraValue.js';

export function applyMoviePerformanceRecordedCamera(entries, camera) {
	const entry = [...entries].reverse().find(item => (
		item.take.cameraSamples?.length
		&& ['recorded', 'follow', 'firstPerson'].includes(item.take.cameraMode)
	));
	if (!entry) {
		return null;
	}
	const sample = sampleMoviePerformanceCamera(
		entry.take.cameraSamples,
		entry.localTime
	);
	if (!sample) {
		return null;
	}
	return {
		clipId: entry.clip.id,
		sample: applyMoviePerformanceCamera(camera, sample),
		takeId: entry.take.id
	};
}
