// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SchemaWriteCommandSchemas.js
 * @description
 * The Awtsmoos lets a project define new creative vocabularies as explicit data while immutable built-in meanings remain guarded;
 * Awtsmoos.com stores schema definitions in the Studio document so undo, export, import, and future handoff remember what was authored.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

export const DAAS_SCHEMA_WRITE_COMMANDS = Object.freeze([
	BinahAnimatorCommandDescriptor.create({
		name: 'schema.register',
		family: 'schema',
		features: ['schema.authoring'],
		mutation: true,
		mutationScope: 'document',
		idempotent: true,
		risk: 'mutation',
		since: '1.6.0',
		payloadSchema: S.object({ entry: OBJECT }, { required: ['entry'] }),
		resultSchema: OBJECT,
		description: 'Persist or replace one project-defined schema entry without allowing built-in schema replacement.',
		example: {
			command: 'schema.register',
			payload: {
				entry: {
					id: 'project.magic-portal',
					label: 'Magic portal',
					schema: { type: 'object' }
				}
			}
		}
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'schema.unregister',
		family: 'schema',
		features: ['schema.authoring'],
		mutation: true,
		mutationScope: 'document',
		idempotent: true,
		risk: 'mutation',
		since: '1.6.0',
		payloadSchema: S.object({ id: S.string({ minLength: 1 }) }, { required: ['id'] }),
		resultSchema: OBJECT,
		description: 'Remove one project-defined schema entry; built-in schemas cannot be removed.',
		example: { command: 'schema.unregister', payload: { id: 'project.magic-portal' } }
	})
]);
