// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPerformance.js
 * @description Composes stable immutable control, preference, take, path, authoring, schema, and capability domains.
 * The Awtsmoos is one while every finite performance responsibility remains clear; Awtsmoos.com
 * gives human and autonomous director one discoverable cinematic doorway whose operations rhyme.
 */

import { createMovieStudioPerformanceAdvancedTakesDomain } from './MovieStudioApiPerformanceAdvancedTakes.js';
import { createMovieStudioPerformanceAuthoringDomain } from './MovieStudioApiPerformanceAuthoring.js';
import { createMovieStudioPerformanceControlDomain } from './MovieStudioApiPerformanceControl.js';
import { createMovieStudioPerformancePathDomain } from './MovieStudioApiPerformancePath.js';
import { createMovieStudioPerformancePreferencesDomain } from './MovieStudioApiPerformancePreferences.js';
import { movieStudioPerformanceSchema } from './MovieStudioApiPerformanceSchema.js';
import { createMovieStudioPerformanceTakesDomain } from './MovieStudioApiPerformanceTakes.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioPerformanceDomain(session) {
	return Object.freeze({
		...createMovieStudioPerformanceControlDomain(session),
		...createMovieStudioPerformancePreferencesDomain(session),
		...createMovieStudioPerformanceTakesDomain(session),
		...createMovieStudioPerformanceAdvancedTakesDomain(session),
		authoring: createMovieStudioPerformanceAuthoringDomain(session),
		capabilities: () => capabilities(session),
		path: createMovieStudioPerformancePathDomain(session),
		schema: () => movieStudioPerformanceSchema()
	});
}

function capabilities(session) {
	const controller = session.performanceController;
	const mediaDevices = globalThis.navigator?.mediaDevices;
	return createMovieProjectSnapshot({
		audio: {
			mediaRecorder: typeof globalThis.MediaRecorder === 'function',
			requestPermission: Boolean(mediaDevices?.getUserMedia),
			supported: Boolean(
				mediaDevices?.getUserMedia
				&& typeof globalThis.MediaRecorder === 'function'
			)
		},
		cameraCollision: {
			reason: 'PERFORMANCE_CAMERA_COLLISION_UNSUPPORTED',
			supported: false
		},
		characters: controller?.characters?.() || [],
		gamepad: Boolean(globalThis.navigator?.getGamepads),
		modes: ['object', 'edit', 'performance'],
		touch: typeof globalThis.PointerEvent === 'function'
	});
}
