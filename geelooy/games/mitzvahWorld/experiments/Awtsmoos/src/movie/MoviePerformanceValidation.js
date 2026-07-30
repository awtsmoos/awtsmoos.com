// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceValidation.js
 * @description Rejects oversized, duplicate, malformed, or unbounded cinematic performances.
 * The Awtsmoos grants freedom without corruption; Awtsmoos.com keeps every take,
 * cue, sample, event, and recovered witness finite, named, ordered, and bright.
 */

import { MOVIE_PERFORMANCE_LIMITS } from './MoviePerformanceConstants.js';

export function validateMoviePerformance(performance, projectDuration = Infinity) {
	const issues = [];
	if (!performance || typeof performance !== 'object') {
		return [problem('PERFORMANCE_REQUIRED', 'Performance must be an object.')];
	}
	boundedList(issues, performance.takes, MOVIE_PERFORMANCE_LIMITS.takes, 'takes');
	boundedList(issues, performance.cues, MOVIE_PERFORMANCE_LIMITS.cues, 'cues');
	boundedList(issues, performance.recovery, MOVIE_PERFORMANCE_LIMITS.recovery, 'recovery');
	uniqueIds(issues, performance.takes, 'take');
	uniqueIds(issues, performance.performers, 'performer');
	for (const take of performance.takes || []) {
		validateTake(issues, take, projectDuration);
	}
	for (const cue of performance.cues || []) {
		if (!finite(cue.time) || cue.time < 0 || cue.time > projectDuration) {
			issues.push(problem('PERFORMANCE_CUE_TIME_INVALID', `Cue ${cue.id} has invalid time.`));
		}
	}
	return issues;
}

function validateTake(issues, take, projectDuration) {
	if (!take?.id || !take.characterId) {
		issues.push(problem('PERFORMANCE_TAKE_IDENTITY_REQUIRED', 'Every take needs id and characterId.'));
	}
	if (![24, 30, 60].includes(take.sampleRate)) {
		issues.push(problem('PERFORMANCE_SAMPLE_RATE_INVALID', `Take ${take.id} sample rate is invalid.`));
	}
	if (!finite(take.start) || take.start < 0 || take.start > projectDuration) {
		issues.push(problem('PERFORMANCE_TAKE_START_INVALID', `Take ${take.id} start is invalid.`));
	}
	if (!finite(take.duration) || take.duration < 0 || take.duration > projectDuration) {
		issues.push(problem('PERFORMANCE_TAKE_DURATION_INVALID', `Take ${take.id} duration is invalid.`));
	}
	boundedList(issues, take.transformSamples, MOVIE_PERFORMANCE_LIMITS.samples, `${take.id}.samples`);
	boundedList(issues, take.actionEvents, MOVIE_PERFORMANCE_LIMITS.actions, `${take.id}.actions`);
	validateTimes(issues, take.transformSamples, take.duration, take.id, 'sample');
	validateTimes(issues, take.actionEvents, take.duration, take.id, 'action');
	for (const sample of take.transformSamples || []) {
		for (const field of ['position', 'rotation', 'scale', 'velocity']) {
			if (!vector(sample[field])) {
				issues.push(problem('PERFORMANCE_VECTOR_INVALID', `${take.id} ${field} must be finite vec3.`));
			}
		}
}
}

function validateTimes(issues, values = [], duration, takeId, kind) {
	let previous = -Infinity;
	for (const value of values) {
		const invalid = !finite(value.time)
			|| value.time < 0
			|| value.time > duration + 0.001
			|| value.time < previous;
		if (invalid) {
			issues.push(problem('PERFORMANCE_TIME_INVALID', `${takeId} ${kind} times must be ordered and bounded.`));
			return;
		}
		previous = value.time;
	}
}

function boundedList(issues, value, maximum, name) {
	if (!Array.isArray(value)) {
		issues.push(problem('PERFORMANCE_LIST_REQUIRED', `${name} must be an array.`));
	} else if (value.length > maximum) {
		issues.push(problem('PERFORMANCE_LIST_TOO_LARGE', `${name} exceeds ${maximum}.`));
	}
}

function uniqueIds(issues, values = [], name) {
	const ids = new Set();
	for (const value of values || []) {
		if (!value?.id || ids.has(value.id)) {
			issues.push(problem('PERFORMANCE_ID_DUPLICATE', `${name} ids must be unique.`));
		}
		ids.add(value?.id);
	}
}

function vector(value) {
	return Array.isArray(value) && value.length === 3 && value.every(finite);
}

function finite(value) {
	return Number.isFinite(Number(value));
}

function problem(code, message) {
	return { code, message, path: 'performance' };
}
