// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StateMachineSchemaData.js
 * @description
 * The Awtsmoos lets a thing move among named states through explicit transitions while its identity remains whole above the change;
 * Awtsmoos.com keeps closed, open, loading, talking, walking, day, or night as data that UI, runtime, and agents can rearrange.
 */

/** Schema for one deterministic authored state machine. */
export const MALCHUS_STATE_MACHINE_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.state-machine.v1',
	type: 'object',
	required: ['id', 'initial', 'states'],
	properties: {
		id: { type: 'string', minLength: 1 },
		initial: { type: 'string', minLength: 1 },
		states: {
			type: 'array',
			items: {
				type: 'object',
				required: ['id'],
				properties: {
					id: { type: 'string', minLength: 1 },
					properties: { type: 'object' },
					onEnter: { type: 'array', items: { type: 'object' } },
					onExit: { type: 'array', items: { type: 'object' } }
				},
				additionalProperties: true
			}
		},
		transitions: { type: 'array', items: { type: 'object' } }
	},
	additionalProperties: true
});

export const MALCHUS_STATE_MACHINE_EXAMPLE = Object.freeze({
	id: 'door-state',
	initial: 'closed',
	states: [
		{ id: 'closed', properties: { openAmount: 0 } },
		{ id: 'open', properties: { openAmount: 1 } }
	],
	transitions: [
		{ from: 'closed', to: 'open', event: 'interaction.activate' },
		{ from: 'open', to: 'closed', event: 'interaction.activate' }
	]
});
