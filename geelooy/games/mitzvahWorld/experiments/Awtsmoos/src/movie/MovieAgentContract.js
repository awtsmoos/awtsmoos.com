// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAgentContract.js
 * @description Publishes the JSON-only contract for literal and opt-in cinematic AI movie generation.
 * The Awtsmoos is beyond schema and instruction; Awtsmoos.com gives every agent one
 * finite grammar for scene, camera, world, actor, dialogue, audio, and nested intention.
 */

import {
	MOVIE_AGENT_MANIFEST_KIND,
	MOVIE_AGENT_MANIFEST_VERSION,
	MOVIE_PROJECT_SCHEMA_VERSION
} from './MovieApiConstants.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieAgentContract() {
	return createMovieProjectSnapshot({
		acceptedForms: [
			'Complete canonical project in manifest.project',
			'Sequential scene plan in manifest.scenes'
		],
		beatCommonFields: {
			duration: 'positive seconds, defaults to remaining scene duration',
			easing: 'supported deterministic easing name',
			id: 'optional globally unique clip id',
			offset: 'seconds relative to scene start',
			target: 'actor, door, or runtime target id',
			type: 'supported track type'
		},
		generationProfile: {
			ambientKind: 'optional generated ambient audio kind',
			ambientVolume: 'optional finite generated ambient volume',
			cameraRigs: 'optional ordered supported rig ids',
			cinematic: 'true opts into deterministic enrichment',
			grade: 'optional default scene grade',
			transition: 'optional default scene transition',
			world: 'optional default world identity'
		},
		generationRules: [
			'Use finite numbers only.',
			'Keep every clip inside project duration.',
			'Give every authored entity a stable unique id.',
			'Use explicit transforms or supported camera rigs.',
			'Do not include functions, DOM nodes, or cyclic references.'
		],
		kind: MOVIE_AGENT_MANIFEST_KIND,
		manifestFields: {
			cameraRigs: 'optional canonical camera rig definitions',
			characters: 'optional serializable character definitions',
			generation: 'optional deterministic cinematic enrichment profile',
			metadata: 'optional agent, prompt, request, and provenance data',
			project: 'optional complete canonical movie project',
			scenes: 'ordered scenes with duration, beats, and optional world',
			seed: 'finite deterministic procedural seed',
			title: 'human-readable movie title'
		},
		manifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		projectSchemaVersion: MOVIE_PROJECT_SCHEMA_VERSION,
		sceneFields: {
			beats: 'ordered relative timeline instructions',
			duration: 'positive scene duration',
			grade: 'optional color grade',
			id: 'optional stable identity',
			label: 'optional human label',
			start: 'optional absolute project time',
			transition: 'optional transition name',
			world: 'optional serializable world identity'
		},
		supportedTrackTypes: {
			actor: ['action', 'animation', 'at', 'face', 'from', 'height', 'to'],
			audio: ['frequency', 'kind', 'url', 'volume'],
			camera: ['anchor', 'from', 'rig', 'shot', 'target', 'to'],
			crowd: ['action', 'animation', 'at', 'count', 'from', 'to'],
			dialogue: ['speaker', 'text'],
			door: ['from', 'to'],
			event: ['name', 'payload'],
			scene: ['grade', 'label', 'transition', 'world'],
			sequence: ['sequenceId']
		}
	});
}
