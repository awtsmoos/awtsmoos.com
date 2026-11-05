// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePath.js
 * @description Edits trajectory points, facing, smoothing, simplification, and retiming.
 * The Awtsmoos reveals a path without chaining the soul to its first trace; Awtsmoos.com
 * lets director and performer refine blocking while action timing remains explicit in rhyme.
 */

import { simplifyMoviePerformanceSamples } from './MoviePerformanceCompression.js';
import {
	moviePerformanceClone,
	moviePerformanceVector
} from './MoviePerformanceValue.js';

export function moveMoviePerformancePoint(take, index, position) {
	return updateSamples(take, samples => samples.map((sample, sampleIndex) => (
		sampleIndex === index
			? { ...sample, position: moviePerformanceVector(position, sample.position) }
			: sample
	)));
}

export function deleteMoviePerformancePoint(take, index) {
	if ((take.transformSamples || []).length <= 2) {
		throw new Error('PERFORMANCE_PATH_MINIMUM_POINTS');
	}
	return updateSamples(take, samples => (
		samples.filter((unused, sampleIndex) => sampleIndex !== index)
	));
}

export function simplifyMoviePerformancePath(take, options = {}) {
	return updateSamples(take, samples => (
		simplifyMoviePerformanceSamples(samples, options)
	));
}

export function smoothMoviePerformancePath(take, strength = 0.35) {
	const amount = Math.max(0, Math.min(1, Number(strength) || 0));
	return updateSamples(take, samples => samples.map((sample, index) => {
		if (!index || index === samples.length - 1) {
			return sample;
		}
		const average = sample.position.map((unused, axis) => (
			(samples[index - 1].position[axis] + samples[index + 1].position[axis]) / 2
		));
		return {
			...sample,
			position: sample.position.map((value, axis) => (
				value + (average[axis] - value) * amount
			))
		};
	}));
}

export function retimeMoviePerformanceTake(take, duration, options = {}) {
	const nextDuration = Math.max(0.01, Number(duration) || take.duration);
	const ratio = nextDuration / Math.max(0.01, take.duration);
	const next = moviePerformanceClone(take);
	next.duration = nextDuration;
	next.transformSamples = retime(next.transformSamples, ratio);
	next.animationSamples = retime(next.animationSamples, ratio);
	next.cameraSamples = retime(next.cameraSamples, ratio);
	if (options.preserveActionTiming !== true) {
		next.actionEvents = retime(next.actionEvents, ratio);
		next.interactionEvents = retime(next.interactionEvents, ratio);
	}
	return next;
}

export function setMoviePerformanceFacing(take, index, yaw) {
	return updateSamples(take, samples => samples.map((sample, sampleIndex) => (
		sampleIndex === index
			? { ...sample, rotation: [sample.rotation[0], Number(yaw) || 0, sample.rotation[2]] }
			: sample
	)));
}

function retime(samples, ratio) {
	return samples.map(sample => ({
		...sample,
		time: sample.time * ratio
	}));
}

function updateSamples(take, operation) {
	const next = moviePerformanceClone(take);
	next.transformSamples = operation(next.transformSamples);
	return next;
}
