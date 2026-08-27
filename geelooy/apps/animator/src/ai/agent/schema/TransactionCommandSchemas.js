// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TransactionCommandSchemas.js
 * @description
 * The Awtsmoos lets a list of canonical JSON command envelopes become one previewable editing proposal before any live state is renewed;
 * Awtsmoos.com keeps plan pure and commit explicit, giving human and AI creators structured consequence instead of hidden batch behavior accrued.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();
const REQUESTS = S.array(OBJECT, { minItems: 1, maxItems: 100 });

function readCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'transaction',
		features: ['transaction.atomic-editing'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.6.0',
		...keliInput
	});
}

export const MALCHUS_TRANSACTION_COMMANDS = Object.freeze([
	readCommand({
		name: 'transaction.capabilities',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Inspect atomic transaction guarantees and excluded side effects.',
		example: { command: 'transaction.capabilities', payload: {} }
	}),
	readCommand({
		name: 'transaction.allowedCommands',
		payloadSchema: OBJECT,
		resultSchema: S.array(OBJECT),
		description: 'List canonical commands currently admitted by the isolated transaction policy.',
		example: { command: 'transaction.allowedCommands', payload: {} }
	}),
	readCommand({
		name: 'transaction.plan',
		payloadSchema: S.object(
			{ requests: REQUESTS, options: OBJECT },
			{ required: ['requests'] }
		),
		resultSchema: OBJECT,
		description: 'Dry-run safe commands in isolation and return results plus structured project diff.',
		example: {
			command: 'transaction.plan',
			payload: {
				requests: [
					{ command: 'object.setTraits', payload: { id: 'actor_1', traits: ['rigged'] } }
				]
			}
		}
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'transaction.commit',
		family: 'transaction',
		features: ['transaction.atomic-editing'],
		mutation: true,
		mutationScope: 'document',
		idempotent: false,
		risk: 'mutation',
		since: '1.6.0',
		payloadSchema: S.object(
			{ requests: REQUESTS, options: OBJECT },
			{ required: ['requests'] }
		),
		resultSchema: OBJECT,
		description: 'Re-plan safe commands against current state and commit the resulting durable project as one undo step.',
		example: {
			command: 'transaction.commit',
			payload: {
				requests: [
					{ command: 'object.setRepresentation', payload: { id: 'actor_1', kind: 'spritePlane', representation: { enabled: true, depth: 12 } } }
				]
			}
		}
	})
]);
