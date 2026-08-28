// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObjectReadCommandSchemas.js
 * @description
 * The Awtsmoos lets agents behold drawable identity, traits, tags, and dependency relationships without touching authored state;
 * Awtsmoos.com keeps object queries as plain JSON filters so humans and AI kiddos can generate exact requests without prose fate.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();
const ID = S.object({ id: S.string({ minLength: 1 }) }, { required: ['id'] });

function objectRead(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'object',
		features: ['object.renderables'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.6.0',
		...keliInput
	});
}

export const KETER_OBJECT_READ_COMMANDS = Object.freeze([
	objectRead({
		name: 'object.capabilities',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Discover universal drawable traits, representations, and query capabilities.',
		example: { command: 'object.capabilities', payload: {} }
	}),
	objectRead({
		name: 'object.list',
		payloadSchema: OBJECT,
		resultSchema: S.array(OBJECT),
		description: 'List every Studio entity that can resolve to a universal renderable descriptor.',
		example: { command: 'object.list', payload: {} }
	}),
	objectRead({
		name: 'object.get',
		payloadSchema: ID,
		resultSchema: OBJECT,
		description: 'Inspect one universal renderable by canonical entity identity.',
		example: { command: 'object.get', payload: { id: 'actor_1' } }
	}),
	objectRead({
		name: 'object.query',
		payloadSchema: S.object({ filter: OBJECT }),
		resultSchema: S.array(OBJECT),
		description: 'Query renderables by id, type, trait, tag, visibility, selection, or text.',
		example: { command: 'object.query', payload: { filter: { trait: 'texturable', selected: true } } }
	}),
	objectRead({
		name: 'object.dependencies',
		payloadSchema: ID,
		resultSchema: S.array(OBJECT),
		description: 'Resolve authored dependency IDs for one renderable into detached descriptors.',
		example: { command: 'object.dependencies', payload: { id: 'prop_1' } }
	}),
	objectRead({
		name: 'object.dependents',
		payloadSchema: ID,
		resultSchema: S.array(OBJECT),
		description: 'Find renderables whose authored dependency list references the supplied object.',
		example: { command: 'object.dependents', payload: { id: 'symbol_1' } }
	})
]);
