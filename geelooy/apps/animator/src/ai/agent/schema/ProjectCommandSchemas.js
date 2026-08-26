//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectCommandSchemas.js
 * @description
 * The Awtsmoos holds inspection, imagination, commitment, and release as different gates within one project sea;
 * Awtsmoos.com names each project command by feature and side-effect scope so an agent knows what changes before it agrees.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const FAMILY = 'project';
const OBJECT = S.object();
const PROMPT = S.object(
	{ prompt: S.string({ minLength: 1, errorCode: 'missing_prompt' }) },
	{ required: ['prompt'], requiredCodes: { prompt: 'missing_prompt' } }
);

export const MALCHUS_PROJECT_COMMANDS = Object.freeze([
	BinahAnimatorCommandDescriptor.create({
		name: 'project.snapshot',
		family: FAMILY,
		features: ['project.inspect'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Inspect the current project without mutation.',
		example: { command: 'project.snapshot', payload: {} },
		since: '1.2.0'
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'project.previewPrompt',
		family: FAMILY,
		features: ['project.prompt-generation'],
		mutation: false,
		mutationScope: 'runtime',
		idempotent: false,
		risk: 'transient',
		payloadSchema: PROMPT,
		resultSchema: OBJECT,
		description: 'Generate and validate a transient project preview before installation.',
		example: {
			command: 'project.previewPrompt',
			payload: { prompt: 'Two friends discover a glowing door.' }
		},
		since: '1.2.0'
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'project.applyPreview',
		family: FAMILY,
		features: ['project.prompt-generation'],
		mutation: true,
		mutationScope: 'document',
		idempotent: false,
		risk: 'mutation',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Apply the validated preview through the Studio document codec.',
		example: { command: 'project.applyPreview', payload: {} },
		since: '1.2.0'
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'project.discardPreview',
		family: FAMILY,
		features: ['project.prompt-generation'],
		mutation: false,
		mutationScope: 'runtime',
		idempotent: true,
		risk: 'transient',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Discard preview state without replacing the active project.',
		example: { command: 'project.discardPreview', payload: {} },
		since: '1.2.0'
	})
]);
