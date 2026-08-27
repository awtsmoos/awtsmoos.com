// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RenderableSchemaData.js
 * @description
 * The Awtsmoos lets one authored form remain itself while Canvas, texture, plane, and future backend reveal different garments;
 * Awtsmoos.com publishes this as plain JS data so humans and agents can generate precise JSON without natural-language arguments.
 */

/** Machine-readable schema for the durable universal renderable descriptor. */
export const KETER_RENDERABLE_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.renderable.v1',
	type: 'object',
	required: ['version', 'objectId', 'revision', 'traits', 'representations'],
	properties: {
		version: { type: 'integer', const: 1 },
		objectId: { type: 'string', minLength: 1 },
		revision: { type: 'integer', minimum: 0 },
		traits: {
			type: 'array',
			items: { type: 'string' },
			uniqueItems: true
		},
		bounds: {
			type: 'object',
			properties: {
				x: { type: 'number' },
				y: { type: 'number' },
				width: { type: 'number', minimum: 0 },
				height: { type: 'number', minimum: 0 }
			}
		},
		tags: {
			type: 'array',
			items: { type: 'string' }
		},
		representations: { type: 'object' },
		dependencies: {
			type: 'array',
			items: { type: 'string' }
		}
	},
	additionalProperties: true
});
