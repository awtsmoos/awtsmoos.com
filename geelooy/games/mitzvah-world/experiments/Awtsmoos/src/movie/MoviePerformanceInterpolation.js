// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceInterpolation.js
 * @description Samples transforms, animation states, cameras, and crossed event boundaries.
 * The Awtsmoos renews between recorded points without fracture or disguise; Awtsmoos.com
 * gives position, scale, and wrapped rotation a measured bridge where acted moments rhyme.
 */

import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function sampleMoviePerformanceTake(take, time) {
	const samples = take?.transformSamples || [];
	if (!samples.length) {
		return null;
	}
	const bounded = Math.max(0, Math.min(Number(time) || 0, take.duration || 0));
	const rightIndex = samples.findIndex(sample => sample.time >= bounded);
	if (rightIndex <= 0) {
		return moviePerformanceClone(samples[0]);
	}
	if (rightIndex < 0) {
		return moviePerformanceClone(samples.at(-1));
	}
	const left = samples[rightIndex - 1];
	const right = samples[rightIndex];
	const span = Math.max(0.000001, right.time - left.time);
	const progress = (bounded - left.time) / span;
	return {
		grounded: progress < 0.5 ? left.grounded : right.grounded,
		movementState: progress < 0.5 ? left.movementState : right.movementState,
		position: interpolateVector(left.position, right.position, progress),
		rotation: left.rotation.map((value, index) => (
			interpolateAngle(value, right.rotation[index], progress)
		)),
		scale: interpolateVector(left.scale, right.scale, progress),
		time: bounded,
		velocity: interpolateVector(left.velocity, right.velocity, progress)
	};
}

export function moviePerformanceEventsBetween(events = [], from, to) {
	if (to < from) {
		return [];
	}
	return events.filter(event => event.time > from && event.time <= to);
}

export function sampleMoviePerformanceState(samples = [], time) {
	let active = null;
	for (const sample of samples) {
		if (sample.time > time) {
			break;
		}
		active = sample;
	}
	return active ? moviePerformanceClone(active) : null;
}

function interpolateVector(left, right, progress) {
	return left.map((value, index) => (
		value + (right[index] - value) * progress
	));
}

function interpolateAngle(left, right, progress) {
	const fullTurn = Math.PI * 2;
	const positiveWrapped = (
		((right - left + Math.PI) % fullTurn) + fullTurn
	) % fullTurn;
	const shortestDelta = positiveWrapped - Math.PI;
	return left + shortestDelta * progress;
}
