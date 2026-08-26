//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldCommandSchemas.js
 * @description
 * The Awtsmoos gives trees, stones, water, clouds, and fire their procedural vessels from one semantic seed;
 * Awtsmoos.com marks inspection apart from creation so agents know exactly when a world request becomes project deed.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const FAMILY = 'world';
const OBJECT = S.object();
const INTENT = S.object({ kind: S.string({ minLength: 1, errorCode: 'missing_world_kind' }), seed: S.string(), realism: S.string() }, { required: ['kind'], requiredCodes: { kind: 'missing_world_kind' } });

export const YESOD_WORLD_COMMANDS = Object.freeze([
	BinahAnimatorCommandDescriptor.create({ name: 'world.capabilities', family: FAMILY, mutation: false, idempotent: true, risk: 'read', payloadSchema: OBJECT, resultSchema: OBJECT, description: 'Discover deterministic procedural world kinds and material grammar.', example: { command: 'world.capabilities', payload: {} }, since: '1.3.0' }),
	BinahAnimatorCommandDescriptor.create({ name: 'world.inspect', family: FAMILY, mutation: false, idempotent: true, risk: 'read', payloadSchema: INTENT, resultSchema: OBJECT, description: 'Inspect and normalize a world intent without mutating project state.', example: { command: 'world.inspect', payload: { kind: 'tree', seed: 'oak-17', realism: 'natural' } }, since: '1.3.0' }),
	BinahAnimatorCommandDescriptor.create({ name: 'world.create', family: FAMILY, mutation: true, idempotent: false, risk: 'mutation', payloadSchema: INTENT, resultSchema: OBJECT, description: 'Create and select one deterministic procedural world entity in the active Studio document.', example: { command: 'world.create', payload: { kind: 'rock', seed: 'granite-1', realism: 'natural' } }, since: '1.3.0' })
]);
