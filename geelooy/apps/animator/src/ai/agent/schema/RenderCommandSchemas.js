// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RenderCommandSchemas.js
 * @description
 * The Awtsmoos lets backend discovery, effect recipes, graph schema, and render planning remain pure JSON reads before any pixels move;
 * Awtsmoos.com keeps semantic rendering separate from temporary GPU execution so every command can be generated and validated as data.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function renderRead(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'render',
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		since: '1.6.0',
		...keliInput
	});
}

export const TIFERES_RENDER_COMMANDS = Object.freeze([
	renderRead({
		name: 'render.backends',
		features: ['render.backends'],
		payloadSchema: OBJECT,
		resultSchema: S.array(OBJECT),
		description: 'Discover renderer backends and actual runtime availability.',
		example: { command: 'render.backends', payload: {} }
	}),
	renderRead({
		name: 'render.representations',
		features: ['render.backends'],
		payloadSchema: OBJECT,
		resultSchema: S.array(OBJECT),
		description: 'List durable representation kinds and which runtime adapters are currently realized.',
		example: { command: 'render.representations', payload: {} }
	}),
	renderRead({
		name: 'render.effects',
		features: ['render.graphs'],
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'List every built-in non-destructive render-effect recipe.',
		example: { command: 'render.effects', payload: {} }
	}),
	renderRead({
		name: 'render.effect',
		features: ['render.graphs'],
		payloadSchema: S.object(
			{
				name: S.string({ minLength: 1 }),
				overrides: OBJECT
			},
			{ required: ['name'] }
		),
		resultSchema: OBJECT,
		description: 'Create one normalized effect recipe with explicit JSON overrides.',
		example: { command: 'render.effect', payload: { name: 'outline', overrides: { width: 4 } } }
	}),
	renderRead({
		name: 'render.graphSchema',
		features: ['render.graphs'],
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Return the machine-readable render-graph schema.',
		example: { command: 'render.graphSchema', payload: {} }
	}),
	renderRead({
		name: 'render.plan',
		features: ['render.graphs'],
		payloadSchema: S.object({ plan: OBJECT }, { required: ['plan'] }),
		resultSchema: OBJECT,
		description: 'Normalize a source/effect/output request into a deterministic render graph without executing it.',
		example: { command: 'render.plan', payload: { plan: { sourceId: 'actor_1', effects: ['outline'] } } }
	})
]);
