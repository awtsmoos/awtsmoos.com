//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DialogueDirectionCommandSchemas.js
 * @description
 * The Awtsmoos lets speech become articulation and subtitle rhythm through pure contracts before microphone or project state enter;
 * Awtsmoos.com keeps lip-sync direction deterministic and inspectable so agents can reason about every mouth shape with care.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function dialogueCommand(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'dialogue',
		features: ['dialogue.direction'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.5.0',
		...keliInput
	});
}

export const MALCHUS_DIALOGUE_DIRECTION_COMMANDS = Object.freeze([
	dialogueCommand({
		name: 'dialogue.capabilities',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Discover articulation, viseme, subtitle, and recording planning capabilities.',
		example: { command: 'dialogue.capabilities', payload: {} }
	}),
	dialogueCommand({
		name: 'dialogue.articulate',
		payloadSchema: S.object({ input: OBJECT }, { required: ['input'] }),
		resultSchema: OBJECT,
		description: 'Resolve stable production speech articulation into detached mouth-shape data.',
		example: { command: 'dialogue.articulate', payload: { input: { text: 'Shalom', timeMs: 120 } } }
	}),
	dialogueCommand({
		name: 'dialogue.visemes',
		payloadSchema: OBJECT,
		resultSchema: S.array(S.string()),
		description: 'List every stable production viseme identity.',
		example: { command: 'dialogue.visemes', payload: {} }
	}),
	dialogueCommand({
		name: 'dialogue.viseme',
		payloadSchema: S.object({ name: S.string({ minLength: 1 }) }, { required: ['name'] }),
		resultSchema: OBJECT,
		description: 'Resolve one viseme or alias into its normalized production mouth shape.',
		example: { command: 'dialogue.viseme', payload: { name: 'AA' } }
	}),
	dialogueCommand({
		name: 'dialogue.wrapSubtitle',
		payloadSchema: S.object({ text: S.string(), limit: S.number({ minimum: 12, maximum: 120 }) }, { required: ['text'] }),
		resultSchema: S.array(S.string()),
		description: 'Wrap subtitle text into at most three readable production lines.',
		example: { command: 'dialogue.wrapSubtitle', payload: { text: 'A quiet line spoken under the stars.', limit: 42 } }
	})
]);
