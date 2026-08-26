//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldCommandSchemas.js
 * @description
 * The Awtsmoos gives trees, stones, water, clouds, and fire semantic vessels before world creation becomes deed;
 * Awtsmoos.com marks discovery, inspection, and document mutation separately so procedural generation remains safe to read.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const FAMILY = 'world';
const OBJECT = S.object();
const INTENT = S.object(
	{
		kind: S.string({ minLength: 1, errorCode: 'missing_world_kind' }),
		seed: S.string(),
		realism: S.string()
	},
	{ required: ['kind'], requiredCodes: { kind: 'missing_world_kind' } }
);

export const YESOD_WORLD_COMMANDS = Object.freeze([
	BinahAnimatorCommandDescriptor.create({
		name: 'world.capabilities',
		family: FAMILY,
		features: ['world.discovery'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Discover deterministic procedural world kinds and material grammar.',
		example: { command: 'world.capabilities', payload: {} },
		since: '1.3.0'
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'world.inspect',
		family: FAMILY,
		features: ['world.inspect'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		payloadSchema: INTENT,
		resultSchema: OBJECT,
		description: 'Inspect and normalize a world intent without mutating project state.',
		example: {
			command: 'world.inspect',
			payload: { kind: 'tree', seed: 'oak-17', realism: 'natural' }
		},
		since: '1.3.0'
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'world.create',
		family: FAMILY,
		features: ['world.create'],
		mutation: true,
		mutationScope: 'document',
		idempotent: false,
		risk: 'mutation',
		payloadSchema: INTENT,
		resultSchema: OBJECT,
		description: 'Create and select one deterministic procedural world entity.',
		example: {
			command: 'world.create',
			payload: { kind: 'rock', seed: 'granite-1', realism: 'natural' }
		},
		since: '1.3.0'
	})
]);
