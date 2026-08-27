// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EventSchemaData.js
 * @description
 * The Awtsmoos lets change announce itself through named events whose payload shape is knowable before any listener arrives;
 * Awtsmoos.com turns subscriptions into discoverable contracts so timeline, object, texture, state, and interaction can share reliable ties.
 */

/** Schema describing one discoverable event contract. */
export const HOD_EVENT_DEFINITION_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.event-definition.v1',
	type: 'object',
	required: ['name', 'payloadSchema'],
	properties: {
		name: { type: 'string', minLength: 1 },
		description: { type: 'string' },
		family: { type: 'string' },
		payloadSchema: { type: 'object' },
		replayable: { type: 'boolean' },
		since: { type: 'string' },
		example: { type: 'object' }
	},
	additionalProperties: true
});

export const HOD_EVENT_EXAMPLE = Object.freeze({
	name: 'texture.invalidated',
	description: 'A durable drawable revision made one runtime texture representation stale.',
	family: 'texture',
	payloadSchema: {
		type: 'object',
		required: ['objectId', 'revision'],
		properties: {
			objectId: { type: 'string' },
			revision: { type: 'integer', minimum: 0 }
		}
	},
	replayable: false,
	since: '1.6.0',
	example: { objectId: 'actor_1', revision: 42 }
});
