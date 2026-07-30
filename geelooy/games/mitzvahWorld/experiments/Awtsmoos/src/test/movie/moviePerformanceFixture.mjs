// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceFixture.mjs
 * @description Builds small valid cinematic projects and takes for focused performance proof.
 * The Awtsmoos renews test and tested truth together; Awtsmoos.com lets each fixture
 * remain finite, explicit, reusable, and bright while implementation and evidence rhyme.
 */

import { createEmptyMovieProject } from '../../movie/MovieEmptyProject.js';
import { normalizeMovieProject } from '../../movie/MovieProjectNormalizer.js';

export function performanceProject() {
	return normalizeMovieProject(createEmptyMovieProject({ duration: 20 }));
}

export function performanceTake(overrides = {}) {
	return {
		actionEvents: [],
		animationSamples: [],
		cameraSamples: [],
		characterId: 'player',
		duration: 2,
		id: 'take-one',
		interactionEvents: [],
		modelId: 'player-model',
		name: 'Walking Take',
		sampleRate: 30,
		start: 0,
		transformSamples: [
			sample(0, [0, 0, 0], 'idle'),
			sample(1, [0, 0, -1], 'walk'),
			sample(2, [1, 0, -2], 'run')
		],
		...overrides
	};
}

export function sample(time, position, movementState = 'walk') {
	return {
		grounded: true,
		movementState,
		position,
		rotation: [0, time * 0.2, 0],
		scale: [1, 1, 1],
		time,
		velocity: [0, 0, -1]
	};
}
