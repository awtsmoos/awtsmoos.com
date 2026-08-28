// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DocumentCommandSchemas.js
 * @description
 * The Awtsmoos lets one Studio document be inspected, proven, parsed, serialized, and deliberately installed through named gates;
 * Awtsmoos.com keeps the install mutation explicit and undo-aware while every other document command remains detached data.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function documentCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'document',
		features: ['document.io'],
		since: '1.5.0',
		resultSchema: OBJECT,
		...keliInput
	});
}

export const BINAH_DOCUMENT_COMMANDS = Object.freeze([
	documentCommand({
		name: 'document.current',
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		payloadSchema: OBJECT,
		description: 'Inspect the current canonical Studio document as detached data.',
		example: { command: 'document.current', payload: {} }
	}),
	documentCommand({
		name: 'document.validate',
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		payloadSchema: S.object({ document: OBJECT }, { required: ['document'] }),
		description: 'Validate one Studio document without installing it.',
		example: { command: 'document.validate', payload: { document: { entities: [], clips: [] } } }
	}),
	documentCommand({
		name: 'document.parse',
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		payloadSchema: S.object({ text: S.string({ minLength: 1 }) }, { required: ['text'] }),
		description: 'Parse, normalize, and validate Studio JSON without mutation.',
		example: { command: 'document.parse', payload: { text: '{"entities":[],"clips":[]}' } }
	}),
	documentCommand({
		name: 'document.serialize',
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		payloadSchema: S.object({ document: OBJECT }),
		description: 'Serialize an explicit or current Studio document after validation.',
		example: { command: 'document.serialize', payload: {} }
	}),
	documentCommand({
		name: 'document.install',
		mutation: true,
		mutationScope: 'document',
		idempotent: true,
		risk: 'mutation',
		payloadSchema: S.object({ document: OBJECT }, { required: ['document'] }),
		description: 'Install one validated Studio document through a single undo-aware store transaction.',
		example: { command: 'document.install', payload: { document: { entities: [], clips: [] } } }
	})
]);
