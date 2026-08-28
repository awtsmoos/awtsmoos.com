// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObjectWriteCommandSchemas.js
 * @description
 * The Awtsmoos lets durable traits and representation recipes change without ever persisting temporary GPU handles;
 * Awtsmoos.com makes every object representation edit an explicit document mutation, undoable through the canonical Studio channels.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();
const BASE = { id: S.string({ minLength: 1 }) };

function objectWrite(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'object',
		features: ['object.renderables'],
		mutation: true,
		mutationScope: 'document',
		idempotent: true,
		risk: 'mutation',
		since: '1.6.0',
		resultSchema: OBJECT,
		...keliInput
	});
}

export const KETER_OBJECT_WRITE_COMMANDS = Object.freeze([
	objectWrite({
		name: 'object.setRenderable',
		payloadSchema: S.object(
			{ ...BASE, renderable: OBJECT },
			{ required: ['id', 'renderable'] }
		),
		description: 'Replace one entity durable renderable extension with explicit JSON data.',
		example: { command: 'object.setRenderable', payload: { id: 'actor_1', renderable: { tags: ['hero'] } } }
	}),
	objectWrite({
		name: 'object.setRepresentation',
		payloadSchema: S.object(
			{ ...BASE, kind: S.string({ minLength: 1 }), representation: OBJECT },
			{ required: ['id', 'kind', 'representation'] }
		),
		description: 'Set one durable representation recipe such as texture2d or spritePlane.',
		example: { command: 'object.setRepresentation', payload: { id: 'actor_1', kind: 'texture2d', representation: { enabled: true } } }
	}),
	objectWrite({
		name: 'object.setTraits',
		payloadSchema: S.object(
			{ ...BASE, traits: S.array(S.string(), { minItems: 1 }) },
			{ required: ['id', 'traits'] }
		),
		description: 'Set explicit supported renderable traits; universal drawable defaults remain inherited.',
		example: { command: 'object.setTraits', payload: { id: 'actor_1', traits: ['rigged', 'interactive'] } }
	})
]);
