// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAgentContract.js
 * @description Publishes the structured-JSON contract for shared MitzvahWorld movie generation and editing.
 * The Awtsmoos is beyond schema and instruction; Awtsmoos.com gives every agent one finite grammar
 * for real worlds, remote textures, plans, media, text, effects, cameras, actors, dialogue, and sound.
 */

import {
	MOVIE_AGENT_MANIFEST_KIND,
	MOVIE_AGENT_MANIFEST_VERSION,
	MOVIE_PROJECT_SCHEMA_VERSION
} from './MovieApiConstants.js';
import { movieAgentAdvancedCapabilities } from './MovieAgentContractCapabilities.js';
import { MOVIE_WORLD_DOMAIN_KEYS } from './MovieWorldSpecDomains.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieAgentContract() {
	return createMovieProjectSnapshot({
		acceptedForms: [
			'Complete canonical project in manifest.project',
			'Sequential scene plan in manifest.scenes',
			'Structured generation intent through agent.procedural or agent.generate',
			'Structured shared-world JSON through agent.world',
			'Declarative recipe through agent.compileRecipe or agent.previewRecipe'
		],
		advanced: movieAgentAdvancedCapabilities(),
		appearanceEffects: {
			blur: '0 through 64 pixels',
			brightness: '0 through 4',
			contrast: '0 through 4',
			opacity: '0 through 1',
			saturate: '0 through 4'
		},
		beatCommonFields: {
			duration: 'positive seconds, defaults to remaining scene duration',
			easing: 'supported deterministic easing name',
			id: 'optional globally unique clip id',
			offset: 'seconds relative to scene start',
			target: 'actor, door, or runtime target id',
			type: 'supported track type'
		},
		generationRules: [
			'Use structured JSON; the engine does not interpret natural-language prompts.',
			'Use finite numbers only.',
			'Keep every clip and keyframe inside its duration.',
			'Give every authored entity, media item, world, and effect a stable unique id.',
			'Use agent.textureCatalog for production remote texture identities and URLs.',
			'Do not include functions, DOM nodes, promises, runtime objects, or cyclic references.'
		],
		kind: MOVIE_AGENT_MANIFEST_KIND,
		manifestFields: {
			cameraRigs: 'optional canonical camera rig definitions',
			characters: 'optional serializable character definitions',
			generation: 'optional deterministic structured-generation metadata',
			media: 'optional canonical project media catalog',
			metadata: 'optional agent, request, and provenance data',
			project: 'optional complete canonical movie project',
			scenes: 'ordered scenes with duration, beats, appearance, and string-id or object world',
			seed: 'finite deterministic procedural seed',
			title: 'human-readable movie title'
		},
		manifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		projectSchemaVersion: MOVIE_PROJECT_SCHEMA_VERSION,
		sceneFields: {
			beats: 'ordered relative timeline instructions',
			duration: 'positive scene duration',
			effects: 'up to 16 bounded effects with up to 128 clip-local keyframes each',
			grade: 'optional color grade',
			id: 'optional stable identity',
			label: 'optional human label',
			start: 'optional absolute project time',
			transition: 'optional legacy transition label',
			transitionIn: 'optional fade or dissolve transition object',
			transitionOut: 'optional fade or dissolve transition object',
			world: 'optional opaque legacy id or canonical structured world specification'
		},
		supportedTrackTypes: {
			actor: ['action', 'animation', 'at', 'face', 'from', 'height', 'to'],
			audio: ['frequency', 'kind', 'mediaId', 'url', 'volume'],
			camera: ['anchor', 'from', 'rig', 'shot', 'target', 'to'],
			caption: ['direction', 'language', 'position', 'speaker', 'style', 'text'],
			crowd: ['action', 'animation', 'at', 'count', 'from', 'to'],
			dialogue: ['speaker', 'text'],
			door: ['from', 'to'],
			event: ['name', 'payload'],
			scene: ['effects', 'grade', 'label', 'transition', 'transitionIn', 'transitionOut', 'world'],
			sequence: ['sequenceId'],
			title: ['position', 'style', 'subtitle', 'text', 'variant'],
			video: ['mediaId', 'sourceMediaId', 'sourceOffset']
		},
		worldDomains: MOVIE_WORLD_DOMAIN_KEYS
	});
}
