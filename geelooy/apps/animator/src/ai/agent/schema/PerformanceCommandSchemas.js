//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerformanceCommandSchemas.js
 * @description
 * The Awtsmoos lets feeling and motion be named, blended, searched, and composed before a frame is ever changed;
 * Awtsmoos.com publishes acting contracts as data so agents gain expressive depth without hidden mutation rearranged.
 */

import { DaasPerformanceRecipeCatalog } from '../../performance/PerformanceRecipeCatalog.js';
import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const FAMILY = 'performance';
const OBJECT = S.object();
const PROMPT = S.object({ prompt: S.string({ minLength: 1, errorCode: 'missing_prompt' }) }, { required: ['prompt'], requiredCodes: { prompt: 'missing_prompt' } });
const RECIPE = S.object({ name: S.string({ minLength: 1, enum: DaasPerformanceRecipeCatalog.names(), errorCode: 'unknown_recipe' }) }, { required: ['name'], requiredCodes: { name: 'missing_recipe' } });
const EXPRESSION_LAYER = S.object({ expression: S.string({ minLength: 1 }), weight: S.number({ minimum: 0 }), intensity: S.number({ minimum: 0, maximum: 1.5 }) });
const MOTION_LAYER = S.object({ motion: S.string({ minLength: 1 }), weight: S.number({ minimum: 0 }), intensity: S.number({ minimum: 0, maximum: 1.5 }) });

export const TIFERES_PERFORMANCE_COMMANDS = Object.freeze([
	BinahAnimatorCommandDescriptor.create({ name: 'performance.capabilities', family: FAMILY, mutation: false, idempotent: true, risk: 'read', payloadSchema: OBJECT, resultSchema: OBJECT, description: 'Discover expression, motion, recipe, channel, and composition capabilities.', example: { command: 'performance.capabilities', payload: {} }, since: '1.2.0' }),
	BinahAnimatorCommandDescriptor.create({ name: 'performance.recipe', family: FAMILY, mutation: false, idempotent: true, risk: 'read', payloadSchema: RECIPE, resultSchema: OBJECT, description: 'Resolve one named acting recipe into bounded detached performance data.', example: { command: 'performance.recipe', payload: { name: 'subtleListener' } }, since: '1.2.0' }),
	BinahAnimatorCommandDescriptor.create({ name: 'performance.compile', family: FAMILY, mutation: false, idempotent: true, risk: 'read', payloadSchema: PROMPT, resultSchema: OBJECT, description: 'Compile nuanced face, gaze, gesture, timing, and natural-motion direction.', example: { command: 'performance.compile', payload: { prompt: 'Subtle concern, look to partner, then nod.' } }, since: '1.2.0' }),
	BinahAnimatorCommandDescriptor.create({ name: 'performance.blendExpression', family: FAMILY, mutation: false, idempotent: true, risk: 'read', payloadSchema: S.object({ layers: S.array(EXPRESSION_LAYER, { minItems: 1 }) }, { required: ['layers'] }), resultSchema: OBJECT, description: 'Blend weighted semantic expressions into bounded detached face channels.', example: { command: 'performance.blendExpression', payload: { layers: [{ expression: 'curious', weight: 1, intensity: .7 }] } } }),
	BinahAnimatorCommandDescriptor.create({ name: 'performance.blendMotion', family: FAMILY, mutation: false, idempotent: true, risk: 'read', payloadSchema: S.object({ layers: S.array(MOTION_LAYER, { minItems: 1 }) }, { required: ['layers'] }), resultSchema: OBJECT, description: 'Blend weighted semantic motion into bounded natural-motion channels.', example: { command: 'performance.blendMotion', payload: { layers: [{ motion: 'idle', weight: 1, intensity: .7 }] } } }),
	BinahAnimatorCommandDescriptor.create({ name: 'performance.recipeSearch', family: FAMILY, mutation: false, idempotent: true, risk: 'read', payloadSchema: S.object({ query: S.string(), tag: S.string() }), resultSchema: S.array(OBJECT), description: 'Search reusable acting recipes by deterministic name, label, or tag matching.', example: { command: 'performance.recipeSearch', payload: { tag: 'dialogue' } } })
]);
