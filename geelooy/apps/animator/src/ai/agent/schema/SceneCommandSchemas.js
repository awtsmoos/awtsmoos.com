// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SceneCommandSchemas.js
 * @description
 * The Awtsmoos lets layered world, preset, and safe staging become explicit data before the editor must change;
 * Awtsmoos.com keeps scene composition pure while the one live safe-area read declares its runtime gate.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function sceneCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'scene',
		features: ['scene.authoring'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.5.0',
		resultSchema: OBJECT,
		...keliInput
	});
}

export const MALCHUS_SCENE_COMMANDS = Object.freeze([
	sceneCommand({
		name: 'scene.capabilities',
		payloadSchema: OBJECT,
		description: 'Discover detached scene composition, presets, and safe-area capabilities.',
		example: { command: 'scene.capabilities', payload: {} }
	}),
	sceneCommand({
		name: 'scene.preset',
		payloadSchema: S.object({ name: S.string() }),
		description: 'Resolve one named production scene preset as detached JSON.',
		example: { command: 'scene.preset', payload: { name: 'cityParkDay' } }
	}),
	sceneCommand({
		name: 'scene.compose',
		payloadSchema: S.object(
			{
				scene: OBJECT,
				frame: OBJECT,
				options: OBJECT
			},
			{ required: ['scene'] }
		),
		description: 'Compose a pure VirtualGraph scene using width/height data rather than a raw canvas.',
		example: {
			command: 'scene.compose',
			payload: {
				scene: { style: 'production' },
				frame: { width: 1280, height: 720 }
			}
		}
	}),
	sceneCommand({
		name: 'scene.safeArea',
		environment: { animatorRuntime: true },
		payloadSchema: OBJECT,
		description: 'Inspect the live production canvas safe-area geometry.',
		example: { command: 'scene.safeArea', payload: {} }
	})
]);
