// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PreflightCommandSchemas.js
 * @description
 * The Awtsmoos lets project concerns be discovered through read-only JSON commands before export, automation, or another agent inherits the scene;
 * Awtsmoos.com keeps preflight evidence detached from repairs so a suggested command never executes merely because a warning has been seen.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function preflightRead(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'preflight',
		features: ['preflight.project-audit'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.6.0',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		...keliInput
	});
}

export const GEVURAH_PREFLIGHT_COMMANDS = Object.freeze([
	preflightRead({
		name: 'preflight.capabilities',
		description: 'Inspect preflight scope, guarantees, and current rule families.',
		example: { command: 'preflight.capabilities', payload: {} }
	}),
	preflightRead({
		name: 'preflight.rules',
		description: 'List stable preflight rule identities and their audited concerns.',
		example: { command: 'preflight.rules', payload: {} }
	}),
	preflightRead({
		name: 'preflight.run',
		description: 'Run the complete read-only project audit and return findings plus severity counts.',
		example: { command: 'preflight.run', payload: {} }
	})
]);
