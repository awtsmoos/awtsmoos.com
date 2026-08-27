// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file VariantSchemaData.js
 * @description
 * The Awtsmoos lets one identity reveal costume, expression, language, lighting, or render variation without copying its soul;
 * Awtsmoos.com keeps variants as sparse JSON overrides so instances remain related, inspectable, and whole.
 */

/** Machine-readable schema for non-destructive named object/composition variants. */
export const TIFERES_VARIANT_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.variant.v1',
	type: 'object',
	required: ['id', 'label', 'overrides'],
	properties: {
		id: { type: 'string', minLength: 1 },
		label: { type: 'string', minLength: 1 },
		kind: {
			type: 'string',
			enum: ['costume', 'expression', 'scene', 'language', 'render', 'custom']
		},
		overrides: { type: 'object' },
		tags: {
			type: 'array',
			items: { type: 'string' },
			uniqueItems: true
		}
	},
	additionalProperties: true
});
