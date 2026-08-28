// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TextureReadCommandSchemas.js
 * @description
 * The Awtsmoos lets texture policy, cache evidence, atlas geometry, and bake intent be known as data before runtime mutation begins;
 * Awtsmoos.com keeps these read/planning commands JSON-first so agents may reason about surfaces without receiving private GPU things.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function textureRead(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'texture',
		features: ['texture.universal'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.6.0',
		...keliInput
	});
}

export const YESOD_TEXTURE_READ_COMMANDS = Object.freeze([
	textureRead({
		name: 'texture.capabilities',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Inspect universal texture eligibility, runtime availability, quality policies, and private-handle guarantees.',
		example: { command: 'texture.capabilities', payload: {} }
	}),
	textureRead({
		name: 'texture.recipe',
		payloadSchema: S.object({ recipe: OBJECT }),
		resultSchema: OBJECT,
		description: 'Normalize a backend-neutral texture recipe without allocating GPU resources.',
		example: { command: 'texture.recipe', payload: { recipe: { quality: 'adaptive' } } }
	}),
	textureRead({
		name: 'texture.stats',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Inspect JSON-safe runtime texture cache memory and lifecycle evidence.',
		example: { command: 'texture.stats', payload: {} }
	}),
	textureRead({
		name: 'texture.atlasPlan',
		payloadSchema: S.object(
			{
				items: S.array(OBJECT),
				options: OBJECT
			},
			{ required: ['items'] }
		),
		resultSchema: OBJECT,
		description: 'Plan deterministic UV-safe atlas regions without allocating a texture.',
		example: {
			command: 'texture.atlasPlan',
			payload: { items: [{ id: 'prop_1', width: 128, height: 96 }] }
		}
	}),
	textureRead({
		name: 'texture.bakePlan',
		payloadSchema: S.object(
			{
				objectId: S.string({ minLength: 1 }),
				start: S.number({ minimum: 0 }),
				end: S.number({ minimum: 0 }),
				fps: S.number({ minimum: 1, maximum: 120 }),
				options: OBJECT
			},
			{ required: ['objectId', 'start', 'end'] }
		),
		resultSchema: OBJECT,
		description: 'Create a deterministic animated-texture or sprite-sheet bake plan without rendering frames.',
		example: {
			command: 'texture.bakePlan',
			payload: { objectId: 'actor_1', start: 0, end: 2000, fps: 24 }
		}
	})
]);
