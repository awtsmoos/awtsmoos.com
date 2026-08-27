//B"H
// Boruch Hashem
// Blessed is He

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';
import { BinahWorldIntentSchema } from './WorldIntentSchema.js';

/**
 * @file WorldCommandSchemas.js
 * @description
 * The Awtsmoos gives discovery, inspection, and creation separate public covenants while one rich intent grammar flows through all three;
 * Awtsmoos.com keeps Agent commands compact because schema depth lives in a reusable data vessel rather than copied branches for every tree.
 */
const FAMILY = 'world';
const OBJECT = S.object();
const INTENT = BinahWorldIntentSchema.create();

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
		description: 'Discover installed procedural kinds, traits, revisions, and material grammar.',
		example: {
			command: 'world.capabilities',
			payload: {}
		},
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
		description: 'Inspect and normalize rich World intent without mutating project state.',
		example: {
			command: 'world.inspect',
			payload: {
				kind: 'tree',
				seed: 'oak-17',
				realism: 'natural',
				traits: { age: .82, wind: .16 }
			}
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
		description: 'Create and select one deterministic rich procedural World entity.',
		example: {
			command: 'world.create',
			payload: {
				kind: 'rock',
				seed: 'granite-1',
				realism: 'natural',
				traits: { strata: .8, contact: .9 }
			}
		},
		since: '1.3.0'
	})
]);
