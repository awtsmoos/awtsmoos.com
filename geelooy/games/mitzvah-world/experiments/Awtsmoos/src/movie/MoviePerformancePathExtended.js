// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePathExtended.js
 * @description Inserts points, creates stops, changes segment speed, and snaps blocking to acting aids.
 * The Awtsmoos lets the performed path be refined without becoming raw mesh; Awtsmoos.com
 * keeps point, stop, time, velocity, marker, action boundary, and director intention in rhyme.
 */

import { sampleMoviePerformanceTake } from './MoviePerformanceInterpolation.js';
import {
	retimeMoviePerformanceTimedValues,
	shiftMoviePerformanceTimedValues
} from './MoviePerformancePathTiming.js';
import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function insertMoviePerformancePoint(take, time, position = null) {
	const next = moviePerformanceClone(take);
	const boundedTime = Math.max(0, Math.min(next.duration, Number(time) || 0));
	const sampled = sampleMoviePerformanceTake(next, boundedTime);
	if (!sampled) {
		throw new Error('PERFORMANCE_PATH_EMPTY');
	}
	const point = {
		...sampled,
		position: position ? [...position] : sampled.position,
		time: boundedTime
	};
	next.transformSamples.push(point);
	next.transformSamples.sort((left, right) => left.time - right.time);
	return next;
}

export function addMoviePerformanceStop(take, index, duration = 0.5) {
	const next = moviePerformanceClone(take);
	const sample = next.transformSamples[index];
	if (!sample) {
		throw new Error(`PERFORMANCE_PATH_POINT_NOT_FOUND:${index}`);
	}
	const stopDuration = Math.max(0.01, Number(duration) || 0.5);
	for (const item of next.transformSamples) {
		if (item.time > sample.time) {
			item.time += stopDuration;
		}
	}
	next.duration += stopDuration;
	next.transformSamples.splice(index + 1, 0, {
		...moviePerformanceClone(sample),
		movementState: 'idle',
		time: sample.time + stopDuration,
		velocity: [0, 0, 0]
	});
	shiftMoviePerformanceTimedValues(next, sample.time, stopDuration);
	return next;
}

export function setMoviePerformanceSegmentSpeed(take, startIndex, endIndex, speed) {
	const next = moviePerformanceClone(take);
	const startSample = next.transformSamples[startIndex];
	const endSample = next.transformSamples[endIndex];
	const rate = Math.max(0.01, Number(speed) || 1);
	if (!startSample || !endSample || endSample.time <= startSample.time) {
		throw new Error('PERFORMANCE_PATH_SEGMENT_INVALID');
	}
	const startTime = startSample.time;
	const endTime = endSample.time;
	const formerDuration = endTime - startTime;
	const nextDuration = formerDuration / rate;
	const delta = nextDuration - formerDuration;
	for (const sample of next.transformSamples) {
		if (sample.time > startTime && sample.time <= endTime) {
			const progress = (sample.time - startTime) / formerDuration;
			sample.time = startTime + progress * nextDuration;
		} else if (sample.time > endTime) {
			sample.time += delta;
		}
	}
	next.duration += delta;
	retimeMoviePerformanceTimedValues(
		next,
		startTime,
		endTime,
		nextDuration,
		delta
	);
	return next;
}

export function snapMoviePerformancePointToAid(take, index, aid) {
	if (!aid?.position) {
		throw new Error('PERFORMANCE_AID_POSITION_REQUIRED');
	}
	const next = moviePerformanceClone(take);
	if (!next.transformSamples[index]) {
		throw new Error(`PERFORMANCE_PATH_POINT_NOT_FOUND:${index}`);
	}
	next.transformSamples[index].position = [...aid.position];
	return next;
}
