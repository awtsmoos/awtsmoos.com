// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceTakeContract.js
 * @description Normalizes one acted take into bounded JSON without a living runtime reference.
 * The Awtsmoos remembers every step without becoming the step; Awtsmoos.com keeps
 * transform, animation, action, camera, and audio witnesses serializable in measured rhyme.
 */

import { MOVIE_PERFORMANCE_LIMITS } from './MoviePerformanceConstants.js';
import { normalizeMoviePerformanceTakeMetadata } from './MoviePerformanceTakeMetadata.js';
import {
	moviePerformanceArray,
	moviePerformanceBounded,
	moviePerformanceFinite,
	moviePerformanceNonnegative,
	moviePerformanceNullableText,
	moviePerformanceObject,
	moviePerformanceText,
	moviePerformanceTimeSort,
	moviePerformanceVector
} from './MoviePerformanceValue.js';

export function normalizeMoviePerformanceTake(source = {}, index = 0) {
	const samples = moviePerformanceArray(
		source.transformSamples,
		MOVIE_PERFORMANCE_LIMITS.samples
	).map(normalizeTransformSample).sort(moviePerformanceTimeSort);
	const duration = Math.max(
		moviePerformanceNonnegative(source.duration, samples.at(-1)?.time || 0),
		samples.at(-1)?.time || 0
	);
	return {
		actionEvents: events(source.actionEvents),
		animationSamples: animationSamples(source.animationSamples),
		audioClipId: moviePerformanceNullableText(source.audioClipId),
		cameraMode: moviePerformanceText(source.cameraMode, 'director'),
		cameraSamples: cameras(source.cameraSamples),
		characterId: moviePerformanceText(source.characterId, 'player'),
		coordinateSpace: moviePerformanceText(source.coordinateSpace, 'world'),
		createdAt: moviePerformanceText(source.createdAt, new Date().toISOString()),
		duration,
		id: moviePerformanceText(source.id, `performance-take-${index + 1}`),
		interactionEvents: events(source.interactionEvents),
		metadata: normalizeMoviePerformanceTakeMetadata(source.metadata),
		modelId: moviePerformanceText(source.modelId, source.characterId || 'player'),
		movementMode: moviePerformanceText(source.movementMode, 'gameplay-collision'),
		name: moviePerformanceText(source.name, `Take ${index + 1}`),
		sampleRate: [24, 30, 60].includes(Number(source.sampleRate))
			? Number(source.sampleRate)
			: 30,
		source: moviePerformanceText(source.source, 'live-performance'),
		start: moviePerformanceNonnegative(source.start),
		transformSamples: samples
	};
}

export function normalizeTransformSample(sample = {}) {
	return {
		grounded: sample.grounded !== false,
		movementState: moviePerformanceText(sample.movementState, 'idle'),
		position: moviePerformanceVector(sample.position),
		rotation: moviePerformanceVector(sample.rotation),
		scale: moviePerformanceVector(sample.scale, [1, 1, 1]),
		time: moviePerformanceNonnegative(sample.time),
		velocity: moviePerformanceVector(sample.velocity)
	};
}

function animationSamples(source) {
	return moviePerformanceArray(source, MOVIE_PERFORMANCE_LIMITS.actions)
		.map(sample => ({
			clip: moviePerformanceText(sample?.clip),
			fadeDuration: moviePerformanceNonnegative(sample?.fadeDuration, 0.15),
			loop: sample?.loop !== false,
			speed: moviePerformanceFinite(sample?.speed, 1),
			state: moviePerformanceText(sample?.state, 'idle'),
			time: moviePerformanceNonnegative(sample?.time),
			weight: moviePerformanceBounded(sample?.weight, 1, 0, 1)
		}))
		.sort(moviePerformanceTimeSort);
}

function events(source) {
	return moviePerformanceArray(source, MOVIE_PERFORMANCE_LIMITS.actions)
		.map((event, index) => ({
			actionId: moviePerformanceText(event?.actionId, event?.id || `action-${index + 1}`),
			id: moviePerformanceText(event?.id, `action-${index + 1}`),
			payload: moviePerformanceObject(event?.payload),
			phase: moviePerformanceText(event?.phase, 'start'),
			time: moviePerformanceNonnegative(event?.time)
		}))
		.sort((left, right) => moviePerformanceTimeSort(left, right) || left.id.localeCompare(right.id));
}

function cameras(source) {
	return moviePerformanceArray(source, MOVIE_PERFORMANCE_LIMITS.samples)
		.map(sample => ({
			fov: moviePerformanceBounded(sample?.fov, 50, 10, 140),
			position: moviePerformanceVector(sample?.position),
			rotation: moviePerformanceVector(sample?.rotation),
			target: moviePerformanceVector(sample?.target, [0, 0, -1]),
			time: moviePerformanceNonnegative(sample?.time)
		}))
		.sort(moviePerformanceTimeSort);
}
