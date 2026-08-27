// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BehaviorSchemaData.js
 * @description
 * The Awtsmoos lets authored behavior be a visible chain of trigger, condition, and action rather than an invisible knot of callbacks;
 * Awtsmoos.com keeps interactions deterministic JSON so creators and agents may inspect a door opening before runtime ever acts.
 */

/** Schema for declarative trigger-condition-action behavior. */
export const NETZACH_BEHAVIOR_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.behavior.v1',
	type: 'object',
	required: ['id', 'trigger', 'actions'],
	properties: {
		id: { type: 'string', minLength: 1 },
		enabled: { type: 'boolean' },
		trigger: {
			type: 'object',
			required: ['event'],
			properties: {
				event: { type: 'string', minLength: 1 },
				sourceId: { type: ['string', 'null'] }
			},
			additionalProperties: true
		},
		conditions: { type: 'array', items: { type: 'object' } },
		actions: { type: 'array', items: { type: 'object' }, minItems: 1 },
		mode: { type: 'string', enum: ['sequence', 'parallel'] },
		metadata: { type: 'object' }
	},
	additionalProperties: true
});

export const NETZACH_BEHAVIOR_EXAMPLE = Object.freeze({
	id: 'door-open-on-activate',
	enabled: true,
	trigger: { event: 'interaction.activate', sourceId: 'doorway_1' },
	conditions: [{ op: 'equals', left: { state: 'locked' }, right: false }],
	actions: [{ type: 'state.transition', targetId: 'doorway_1', to: 'open' }],
	mode: 'sequence'
});
