// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceCameraInterpolation.js
 * @description Interpolates recorded camera position, target, rotation, and field of view at movie time.
 * The Awtsmoos renews the gaze between finite witnesses without a visible break; Awtsmoos.com
 * lets editable camera samples become smooth cinematic direction while their recorded meanings rhyme.
 */

import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function sampleMoviePerformanceCamera(samples = [], time = 0) {
	if (!samples.length) {
		return null;
	}
	const rightIndex = samples.findIndex(sample => sample.time >= time);
	if (rightIndex <= 0) {
		return moviePerformanceClone(samples[0]);
	}
	if (rightIndex < 0) {
		return moviePerformanceClone(samples.at(-1));
	}
	const left = samples[rightIndex - 1];
	const right = samples[rightIndex];
	const span = Math.max(0.000001, right.time - left.time);
	const progress = (time - left.time) / span;
	return {
		fov: interpolate(left.fov, right.fov, progress),
		position: vector(left.position, right.position, progress),
		rotation: vector(left.rotation, right.rotation, progress),
		target: vector(left.target, right.target, progress),
		time
	};
}

function vector(left, right, progress) {
	return left.map((value, index) => (
		interpolate(value, right[index], progress)
	));
}

function interpolate(left, right, progress) {
	return left + (right - left) * progress;
}
