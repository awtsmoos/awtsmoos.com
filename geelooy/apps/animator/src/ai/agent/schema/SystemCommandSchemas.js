//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SystemCommandSchemas.js
 * @description
 * The Awtsmoos lets an agent ask what exists before asking existence to move;
 * Awtsmoos.com makes discovery and health first-class read commands so integration begins with knowledge agents can prove.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const SYSTEM = 'system';
const OBJECT = S.object();

export const KETER_SYSTEM_COMMANDS = Object.freeze([
	BinahAnimatorCommandDescriptor.create({
		name: 'system.describe', family: SYSTEM, mutation: false, idempotent: true, risk: 'read',
		payloadSchema: OBJECT, resultSchema: OBJECT,
		description: 'Describe protocol, commands, schemas, safety metadata, and bootstrap information.',
		example: { command: 'system.describe', payload: {} }
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'system.command', family: SYSTEM, mutation: false, idempotent: true, risk: 'read',
		payloadSchema: S.object({ name: S.string({ minLength: 1 }) }, { required: ['name'] }), resultSchema: OBJECT,
		description: 'Inspect one public command descriptor by stable name.',
		example: { command: 'system.command', payload: { name: 'performance.recipe' } }
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'system.health', family: SYSTEM, mutation: false, idempotent: true, risk: 'read',
		payloadSchema: OBJECT, resultSchema: OBJECT,
		description: 'Return a read-only API readiness and registry health report.',
		example: { command: 'system.health', payload: {} }
	})
]);
