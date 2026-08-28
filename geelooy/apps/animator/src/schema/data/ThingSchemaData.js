// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ThingSchemaData.js
 * @description
 * The Awtsmoos lets any authored thing carry one identity while properties, behaviors, relations, and render garments gather around its light;
 * Awtsmoos.com keeps the root deliberately open to extension, so new creative kinds may enter by schema instead of demanding a new monolith overnight.
 */

/** Universal authored-thing schema shared by characters, props, text, scenes, UI, diagrams, and project-defined kinds. */
export const KETER_THING_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.thing.v1',
	type: 'object',
	required: ['id', 'kind'],
	properties: {
		id: { type: 'string', minLength: 1 },
		kind: { type: 'string', minLength: 1 },
		name: { type: 'string' },
		traits: {
			type: 'array',
			items: { type: 'string' },
			uniqueItems: true
		},
		tags: {
			type: 'array',
			items: { type: 'string' },
			uniqueItems: true
		},
		properties: { type: 'object' },
		relationships: { type: 'array', items: { type: 'object' } },
		representations: { type: 'object' },
		behaviors: { type: 'array', items: { type: 'object' } },
		states: { type: 'object' },
		variants: { type: 'array', items: { type: 'object' } },
		constraints: { type: 'array', items: { type: 'object' } },
		events: { type: 'array', items: { type: 'object' } },
		accessibility: { type: 'object' },
		metadata: { type: 'object' },
		provenance: { type: 'object' },
		extensions: { type: 'object' }
	},
	additionalProperties: true
});

/** Human/AI authoring example that demonstrates composition without prescribing one object class. */
export const KETER_THING_EXAMPLE = Object.freeze({
	id: 'doorway_1',
	kind: 'interactive-doorway',
	name: 'Hidden doorway',
	traits: ['drawable', 'interactive', 'texturable', 'stateful'],
	tags: ['story-prop', 'camera-interest'],
	properties: {
		openAmount: 0
	},
	representations: {
		canvas2d: { enabled: true },
		texture2d: { enabled: true }
	}
});
