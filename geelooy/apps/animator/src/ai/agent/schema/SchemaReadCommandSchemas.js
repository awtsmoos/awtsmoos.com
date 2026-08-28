// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SchemaReadCommandSchemas.js
 * @description
 * The Awtsmoos lets schema discovery, examples, validation, and machine tool definitions be read before any project definition changes;
 * Awtsmoos.com keeps these commands pure and JSON-shaped so external generators can build complex data without natural-language exchange.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function schemaRead(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'schema',
		features: ['schema.authoring'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.6.0',
		...keliInput
	});
}

export const DAAS_SCHEMA_READ_COMMANDS = Object.freeze([
	schemaRead({
		name: 'schema.list',
		payloadSchema: OBJECT,
		resultSchema: S.array(OBJECT),
		description: 'List built-in and active project-defined schema entries.',
		example: { command: 'schema.list', payload: {} }
	}),
	schemaRead({
		name: 'schema.get',
		payloadSchema: S.object({ id: S.string({ minLength: 1 }) }, { required: ['id'] }),
		resultSchema: OBJECT,
		description: 'Read one detached schema catalog entry by stable ID.',
		example: { command: 'schema.get', payload: { id: 'thing' } }
	}),
	schemaRead({
		name: 'schema.validate',
		payloadSchema: S.object(
			{ id: S.string({ minLength: 1 }), value: {} },
			{ required: ['id', 'value'] }
		),
		resultSchema: OBJECT,
		description: 'Validate arbitrary JSON-compatible data against one rich creative schema.',
		example: { command: 'schema.validate', payload: { id: 'texture-recipe', value: { version: 1, enabled: true } } }
	}),
	schemaRead({
		name: 'schema.example',
		payloadSchema: S.object({ id: S.string({ minLength: 1 }) }, { required: ['id'] }),
		resultSchema: {},
		description: 'Read one detached schema authoring example when available.',
		example: { command: 'schema.example', payload: { id: 'thing' } }
	}),
	schemaRead({
		name: 'schema.toolDefinitions',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Generate vendor-neutral machine tool definitions directly from the canonical command registry.',
		example: { command: 'schema.toolDefinitions', payload: {} }
	})
]);
