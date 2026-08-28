// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RepresentationSchemaData.js
 * @description
 * The Awtsmoos lets one object descend through many render worlds without multiplying the object that owns the meaning;
 * Awtsmoos.com names each representation as JSON data so Canvas, texture, atlas, target, plane, and future WebGPU stay siblings.
 */

/** Stable representation kinds understood by the universal render model. */
export const OR_REPRESENTATION_KINDS = Object.freeze([
	'canvas2d',
	'texture2d',
	'atlas-region',
	'render-target',
	'sprite-plane',
	'webgpu-texture'
]);

/** Machine-readable schema for a durable representation recipe. */
export const OR_REPRESENTATION_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.representation.v1',
	type: 'object',
	required: ['version', 'kind', 'enabled'],
	properties: {
		version: { type: 'integer', const: 1 },
		kind: { type: 'string', enum: OR_REPRESENTATION_KINDS },
		enabled: { type: 'boolean' },
		depth: { type: 'number' },
		billboard: {
			type: 'string',
			enum: ['none', 'camera', 'yaw']
		},
		material: {
			type: 'string',
			enum: ['unlit', 'lit', 'emissive']
		},
		opacity: { type: 'number', minimum: 0, maximum: 1 },
		texture: { type: 'object' }
	},
	additionalProperties: true
});
