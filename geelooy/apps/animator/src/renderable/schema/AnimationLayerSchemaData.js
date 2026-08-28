// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimationLayerSchemaData.js
 * @description
 * The Awtsmoos lets locomotion, acting, face, gaze, speech, contact, secondary motion, and override join without becoming one knot;
 * Awtsmoos.com names each layer's weight, blend, seed, and priority so animation remains composable data from root to plot.
 */

export const NETZACH_ANIMATION_LAYER_KINDS = Object.freeze([
	'base-pose',
	'locomotion',
	'acting',
	'face',
	'gaze',
	'speech',
	'hand-contact',
	'foot-contact',
	'secondary-motion',
	'override'
]);

/** Machine-readable schema for one composable animation layer. */
export const NETZACH_ANIMATION_LAYER_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.animation-layer.v1',
	type: 'object',
	required: ['id', 'kind'],
	properties: {
		id: { type: 'string', minLength: 1 },
		kind: { type: 'string', enum: NETZACH_ANIMATION_LAYER_KINDS },
		enabled: { type: 'boolean' },
		weight: { type: 'number', minimum: 0, maximum: 1 },
		blend: { type: 'string', enum: ['replace', 'add', 'multiply', 'masked'] },
		priority: { type: 'integer', minimum: -1000, maximum: 1000 },
		seed: { type: ['string', 'number'] },
		mask: { type: 'object' },
		data: { type: 'object' }
	},
	additionalProperties: true
});
