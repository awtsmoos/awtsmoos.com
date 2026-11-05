// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPerformanceSchema.js
 * @description Publishes machine-readable methods, modes, limits, phases, events, and JSON-safe take shape.
 * The Awtsmoos remains beyond every schema while finite agents require clear vessels; Awtsmoos.com
 * gives actor, intent, range, loop, sample, action, camera, voice, take, and event contracts one rhyme.
 */

import {
	MOVIE_PERFORMANCE_CAMERA_MODES,
	MOVIE_PERFORMANCE_LIMITS,
	MOVIE_PERFORMANCE_MOVEMENT_REFERENCES,
	MOVIE_PERFORMANCE_SAMPLE_RATES,
	MOVIE_PERFORMANCE_VERSION
} from './MoviePerformanceConstants.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { MOVIE_STUDIO_PERFORMANCE_EVENTS } from './MovieStudioApiPerformanceSchemaEvents.js';
import { MOVIE_STUDIO_PERFORMANCE_METHODS } from './MovieStudioApiPerformanceSchemaMethods.js';

export function movieStudioPerformanceSchema() {
	return createMovieProjectSnapshot({
		cameraModes: MOVIE_PERFORMANCE_CAMERA_MODES,
		eventEnvelope: {
			revision: 'number',
			stableIdentifiers: 'takeId|clipId|characterId|aidId|cueId where applicable'
		},
		events: MOVIE_STUDIO_PERFORMANCE_EVENTS,
		limits: MOVIE_PERFORMANCE_LIMITS,
		methods: MOVIE_STUDIO_PERFORMANCE_METHODS,
		movementReferences: MOVIE_PERFORMANCE_MOVEMENT_REFERENCES,
		recorderPhases: [
			'idle', 'armed', 'countdown', 'preRoll', 'recording',
			'paused', 'loopComplete', 'postRoll', 'readyToStop',
			'stopped', 'cancelled'
		],
		resultContract: {
			cyclic: false,
			frozen: true,
			jsonSafe: true,
			runtimeObjects: false
		},
		sampleRates: MOVIE_PERFORMANCE_SAMPLE_RATES,
		take: {
			actionEvents: 'Array<{time,actionId,phase,payload}>',
			animationSamples: 'Array<{time,clip,state,weight,speed,loop,fadeDuration}>',
			cameraSamples: 'Array<{time,position,rotation,target,fov}>',
			fields: [
				'id', 'name', 'characterId', 'modelId', 'start', 'duration',
				'sampleRate', 'coordinateSpace', 'movementMode', 'cameraMode',
				'createdAt', 'source', 'audioClipId', 'metadata'
			],
			transformSamples: 'Array<{time,position,rotation,scale,velocity,grounded,movementState}>'
		},
		version: MOVIE_PERFORMANCE_VERSION
	});
}
