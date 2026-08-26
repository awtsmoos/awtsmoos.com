//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SystemCommandSchemas.js
 * @description
 * The Awtsmoos lets an agent discover protocol, commands, product features, and coverage before asking creation to move;
 * Awtsmoos.com makes self-description first-class data so integration begins with evidence rather than source archaeology to prove.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const SYSTEM = 'system';
const OBJECT = S.object();

function createSystemCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: SYSTEM,
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		resultSchema: OBJECT,
		...keliInput
	});
}

export const KETER_SYSTEM_COMMANDS = Object.freeze([
	createSystemCommand({
		name: 'system.describe',
		features: ['system.protocol'],
		payloadSchema: OBJECT,
		description: 'Describe protocol, commands, schemas, safety metadata, and bootstrap information.',
		example: { command: 'system.describe', payload: {} }
	}),
	createSystemCommand({
		name: 'system.command',
		features: ['system.protocol'],
		payloadSchema: S.object({ name: S.string({ minLength: 1 }) }, { required: ['name'] }),
		description: 'Inspect one public command descriptor by stable name.',
		example: { command: 'system.command', payload: { name: 'performance.recipe' } }
	}),
	createSystemCommand({
		name: 'system.health',
		features: ['system.protocol'],
		payloadSchema: OBJECT,
		description: 'Return a read-only API readiness and registry health report.',
		example: { command: 'system.health', payload: {} }
	}),
	createSystemCommand({
		name: 'system.features',
		features: ['system.features'],
		payloadSchema: S.object({ family: S.string() }),
		description: 'List public product features with current runtime availability.',
		example: { command: 'system.features', payload: {} },
		since: '1.5.0'
	}),
	createSystemCommand({
		name: 'system.feature',
		features: ['system.features'],
		payloadSchema: S.object({ id: S.string({ minLength: 1 }) }, { required: ['id'] }),
		description: 'Inspect one stable product feature and its runtime availability.',
		example: { command: 'system.feature', payload: { id: 'timeline.editing' } },
		since: '1.5.0'
	}),
	createSystemCommand({
		name: 'system.coverage',
		features: ['system.coverage'],
		payloadSchema: OBJECT,
		description: 'Report bidirectional product-feature and command coverage gaps.',
		example: { command: 'system.coverage', payload: {} },
		since: '1.5.0'
	})
]);
