// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceCompression.js
 * @description Removes redundant stillness while preserving turns, grounding, actions, and exact ends.
 * The Awtsmoos loses no deed when repeated vessels fall away; Awtsmoos.com keeps
 * raw evidence beside the simplified path so feet, faces, and timing continue to rhyme.
 */

import {
	moviePerformanceSampleChanged,
	vectorDistance
} from './MoviePerformanceSamples.js';
import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function simplifyMoviePerformanceTake(take, options = {}) {
	const source = take.transformSamples || [];
	const samples = simplifyMoviePerformanceSamples(source, options);
	return {
		...moviePerformanceClone(take),
		metadata: {
			...(take.metadata || {}),
			rawSampleCount: Number(take.metadata?.rawSampleCount || source.length),
			simplifiedSampleCount: samples.length
		},
		transformSamples: samples
	};
}

export function simplifyMoviePerformanceSamples(samples = [], options = {}) {
	if (samples.length <= 2) {
		return samples.map(moviePerformanceClone);
	}
	const output = [moviePerformanceClone(samples[0])];
	for (let index = 1; index < samples.length - 1; index += 1) {
		const previous = output.at(-1);
		const current = samples[index];
		const next = samples[index + 1];
		if (mustKeep(previous, current, next, options)) {
			output.push(moviePerformanceClone(current));
		}
	}
	output.push(moviePerformanceClone(samples.at(-1)));
	return output;
}

export function compressMoviePerformanceStates(samples = []) {
	return samples.filter((sample, index) => (
		index === 0
		|| sample.state !== samples[index - 1].state
		|| sample.clip !== samples[index - 1].clip
	));
}

export function deduplicateMoviePerformanceEvents(events = []) {
	return events.filter((event, index) => {
		const previous = events[index - 1];
		return !previous
			|| event.time !== previous.time
			|| event.actionId !== previous.actionId
			|| event.phase !== previous.phase;
	});
}

function mustKeep(previous, current, next, options) {
	if (!moviePerformanceSampleChanged(previous, current, options)) {
		return false;
	}
	const lineError = distanceFromLine(current.position, previous.position, next.position);
	const rotationChange = vectorDistance(current.rotation, previous.rotation);
	return lineError > (options.position ?? 0.01)
		|| rotationChange > (options.rotation ?? 0.01)
		|| current.grounded !== previous.grounded
		|| current.movementState !== previous.movementState;
}

function distanceFromLine(point, start, end) {
	const span = vectorDistance(start, end);
	if (span < 0.000001) {
		return vectorDistance(point, start);
	}
	const startToPoint = subtract(point, start);
	const startToEnd = subtract(end, start);
	const progress = Math.max(0, Math.min(1, dot(startToPoint, startToEnd) / (span * span)));
	const projected = start.map((value, index) => (
		value + (end[index] - value) * progress
	));
	return vectorDistance(point, projected);
}

function subtract(left, right) {
	return left.map((value, index) => value - right[index]);
}

function dot(left, right) {
	return left.reduce((sum, value, index) => sum + value * right[index], 0);
}
