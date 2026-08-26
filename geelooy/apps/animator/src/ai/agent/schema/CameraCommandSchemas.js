//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CameraCommandSchemas.js
 * @description
 * The Awtsmoos gives lens grammar, actor rigs, scene rigs, and automatic shot intelligence explicit public vessels;
 * Awtsmoos.com marks every camera command pure in this wave, so agents can direct without secretly moving the live editor's levels.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function cameraCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'camera',
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.5.0',
		resultSchema: OBJECT,
		...keliInput
	});
}

export const CHOCHMAH_CAMERA_COMMANDS = Object.freeze([
	cameraCommand({
		name: 'camera.capabilities', features: ['camera.authoring', 'camera.planning'], payloadSchema: OBJECT,
		description: 'Discover available camera grammar, rig, and isolated shot-planning capabilities.',
		example: { command: 'camera.capabilities', payload: {} }
	}),
	cameraCommand({
		name: 'camera.catalog', features: ['camera.authoring'], payloadSchema: OBJECT,
		description: 'Return cinematic shot distance, subject, angle, movement, transition, and pattern vocabulary.',
		example: { command: 'camera.catalog', payload: {} }
	}),
	cameraCommand({
		name: 'camera.actorRigs', features: ['camera.authoring'],
		payloadSchema: S.object({ actors: OBJECT }, { required: ['actors'] }),
		description: 'Derive face, body, and tracking camera rigs for supplied actor data.',
		example: { command: 'camera.actorRigs', payload: { actors: { actor_1: { id: 'actor_1', name: 'Mira', position: { x: 0 } } } } }
	}),
	cameraCommand({
		name: 'camera.sceneRigs', features: ['camera.authoring'],
		payloadSchema: S.object({ scene: OBJECT }, { required: ['scene'] }),
		description: 'Build detached fallback, actor-derived, and authored scene camera rigs.',
		example: { command: 'camera.sceneRigs', payload: { scene: { characters: {} } } }
	}),
	cameraCommand({
		name: 'camera.planShot', features: ['camera.planning'],
		payloadSchema: S.object({ event: OBJECT, state: OBJECT, safe: OBJECT }, { required: ['event', 'state'] }),
		description: 'Plan one automatic shot against an isolated continuity state without mutating the live Animator.',
		example: { command: 'camera.planShot', payload: { event: { shotIntent: 'dialogue', speaker: 'a', listener: 'b' }, state: { characters: {} }, safe: {} } }
	})
]);
