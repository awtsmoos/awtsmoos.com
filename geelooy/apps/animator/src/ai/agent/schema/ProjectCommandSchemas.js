//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectCommandSchemas.js
 * @description
 * The Awtsmoos holds one editable project while preview and commitment remain distinct in time;
 * Awtsmoos.com declares that difference as public data so agents know exactly which action crosses the mutation line.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const FAMILY = 'project';
const OBJECT = S.object();
const PROMPT = S.object({ prompt: S.string({ minLength: 1, errorCode: 'missing_prompt' }) }, { required: ['prompt'], requiredCodes: { prompt: 'missing_prompt' } });

export const MALCHUS_PROJECT_COMMANDS = Object.freeze([
	BinahAnimatorCommandDescriptor.create({ name: 'project.snapshot', family: FAMILY, mutation: false, idempotent: true, risk: 'read', payloadSchema: OBJECT, resultSchema: OBJECT, description: 'Inspect the current project without mutation.', example: { command: 'project.snapshot', payload: {} }, since: '1.2.0' }),
	BinahAnimatorCommandDescriptor.create({ name: 'project.previewPrompt', family: FAMILY, mutation: false, idempotent: false, risk: 'transient', payloadSchema: PROMPT, resultSchema: OBJECT, description: 'Generate and validate a transient project preview before installation.', example: { command: 'project.previewPrompt', payload: { prompt: 'Two friends discover a glowing door.' } }, since: '1.2.0' }),
	BinahAnimatorCommandDescriptor.create({ name: 'project.applyPreview', family: FAMILY, mutation: true, idempotent: false, risk: 'mutation', payloadSchema: OBJECT, resultSchema: OBJECT, description: 'Apply the current validated preview through the Studio document codec.', example: { command: 'project.applyPreview', payload: {} }, since: '1.2.0' }),
	BinahAnimatorCommandDescriptor.create({ name: 'project.discardPreview', family: FAMILY, mutation: false, idempotent: true, risk: 'transient', payloadSchema: OBJECT, resultSchema: OBJECT, description: 'Discard preview state without replacing the active project.', example: { command: 'project.discardPreview', payload: {} }, since: '1.2.0' })
]);
