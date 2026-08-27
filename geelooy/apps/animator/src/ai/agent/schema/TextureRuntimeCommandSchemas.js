// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TextureRuntimeCommandSchemas.js
 * @description
 * The Awtsmoos lets chosen 2D art cross into temporary GPU memory only through commands that plainly declare runtime side effects;
 * Awtsmoos.com keeps realization and release separate from durable recipes so context loss can erase handles without erasing authored gifts.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

export const YESOD_TEXTURE_RUNTIME_COMMANDS = Object.freeze([
	BinahAnimatorCommandDescriptor.create({
		name: 'texture.prepare',
		family: 'texture',
		features: ['texture.universal'],
		mutation: false,
		mutationScope: 'runtime',
		idempotent: true,
		risk: 'transient',
		environment: { browser: true, animatorRuntime: true },
		since: '1.6.0',
		payloadSchema: S.object(
			{
				objectId: S.string({ minLength: 1 }),
				playhead: S.number({ minimum: 0 }),
				recipe: OBJECT
			},
			{ required: ['objectId'] }
		),
		resultSchema: OBJECT,
		description: 'Rasterize one Studio drawable in local space and realize its on-demand WebGL texture without exposing the handle.',
		example: { command: 'texture.prepare', payload: { objectId: 'actor_1' } }
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'texture.releaseAll',
		family: 'texture',
		features: ['texture.universal'],
		mutation: false,
		mutationScope: 'runtime',
		idempotent: true,
		risk: 'transient',
		environment: { browser: true, animatorRuntime: true },
		since: '1.6.0',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Release all disposable cached GPU textures while preserving durable object recipes.',
		example: { command: 'texture.releaseAll', payload: {} }
	})
]);
