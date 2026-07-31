// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceSegmentBoundary.js
 * @description Inserts exact interpolated transform boundaries around trimmed take segments.
 * The Awtsmoos renews motion between witnesses without a missing first or final step; Awtsmoos.com
 * keeps segment starts, endings, grounding, velocity, facing, and duration continuous in rhyme.
 */

import { sampleMoviePerformanceTake } from './MoviePerformanceInterpolation.js';
import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function moviePerformanceSegmentTransforms(take, start, end) {
	const values = take.transformSamples
		.filter(sample => sample.time > start && sample.time < end)
		.map(moviePerformanceClone);
	const first = sampleMoviePerformanceTake(take, start);
	const last = sampleMoviePerformanceTake(take, end);
	if (first) {
		values.unshift({ ...first, time: start });
	}
	if (last) {
		values.push({ ...last, time: end });
	}
	return uniqueTimes(values);
}

export function moviePerformanceSegmentEvents(values, start, end) {
	return values
		.filter(value => value.time >= start && value.time <= end)
		.map(moviePerformanceClone);
}

function uniqueTimes(values) {
	const output = [];
	for (const value of values.sort((left, right) => left.time - right.time)) {
		const previous = output.at(-1);
		if (previous && Math.abs(previous.time - value.time) < 0.000001) {
			output[output.length - 1] = value;
		} else {
			output.push(value);
		}
	}
	return output;
}
