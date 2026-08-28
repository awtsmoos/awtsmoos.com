// B"H
// Boruch Hashem
// Blessed is He

import { BinahCameraCommandFactory } from './CameraCommandFactory.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

/**
 * @file CameraDiscoveryCommandSchemas.js
 * @description
 * The Awtsmoos renews lens vocabulary and rig possibility before a director asks the planner to choose one frame;
 * Awtsmoos.com keeps discovery commands apart from planning commands so the public camera API expands without becoming a single crowded name.
 */
const OBJECT = S.object();

export const CHOCHMAH_CAMERA_DISCOVERY_COMMANDS = Object.freeze([
	BinahCameraCommandFactory.create({
		name: 'camera.capabilities',
		features: ['camera.authoring', 'camera.planning'],
		payloadSchema: OBJECT,
		description: 'Discover available camera grammar, rig, one-shot, and sequence-planning capabilities.',
		example: { command: 'camera.capabilities', payload: {} }
	}),
	BinahCameraCommandFactory.create({
		name: 'camera.catalog',
		features: ['camera.authoring'],
		payloadSchema: OBJECT,
		description: 'Return cinematic shot distance, subject, angle, movement, transition, and pattern vocabulary.',
		example: { command: 'camera.catalog', payload: {} }
	}),
	BinahCameraCommandFactory.create({
		name: 'camera.actorRigs',
		features: ['camera.authoring'],
		payloadSchema: S.object({ actors: OBJECT }, { required: ['actors'] }),
		description: 'Derive face, body, and tracking camera rigs for supplied actor data.',
		example: { command: 'camera.actorRigs', payload: { actors: {} } }
	}),
	BinahCameraCommandFactory.create({
		name: 'camera.sceneRigs',
		features: ['camera.authoring'],
		payloadSchema: S.object({ scene: OBJECT }, { required: ['scene'] }),
		description: 'Build detached fallback, actor-derived, and authored scene camera rigs.',
		example: { command: 'camera.sceneRigs', payload: { scene: { characters: {} } } }
	})
]);
