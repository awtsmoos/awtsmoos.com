// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PropertySchemaData.js
 * @description
 * The Awtsmoos lets every editable value declare its unit, animation promise, bounds, and interface hint before any panel is drawn;
 * Awtsmoos.com keeps property metadata as data so one schema can guide validation, AI generation, UI controls, and render invalidation dawn.
 */

/** Schema describing one property definition inside a project-defined Thing capability. */
export const BINAH_PROPERTY_DEFINITION_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.property-definition.v1',
	type: 'object',
	required: ['type'],
	properties: {
		type: {
			type: 'string',
			enum: ['string', 'number', 'integer', 'boolean', 'color', 'vector2', 'vector3', 'rect', 'time', 'reference', 'object', 'array']
		},
		label: { type: 'string' },
		description: { type: 'string' },
		default: {},
		minimum: { type: 'number' },
		maximum: { type: 'number' },
		step: { type: 'number', minimum: 0 },
		unit: { type: 'string' },
		enum: { type: 'array' },
		animatable: { type: 'boolean' },
		textureAffecting: { type: 'boolean' },
		aiWritable: { type: 'boolean' },
		ui: {
			type: 'object',
			properties: {
				control: { type: 'string' },
				group: { type: 'string' },
				advanced: { type: 'boolean' },
				mobilePriority: { type: 'string', enum: ['high', 'normal', 'low'] }
			},
			additionalProperties: true
		}
	},
	additionalProperties: true
});

export const BINAH_PROPERTY_EXAMPLE = Object.freeze({
	type: 'number',
	label: 'Depth',
	default: 0,
	minimum: -1000,
	maximum: 1000,
	step: 1,
	unit: 'depth-unit',
	animatable: true,
	textureAffecting: false,
	aiWritable: true,
	ui: {
		control: 'range',
		group: 'Render & depth',
		advanced: false,
		mobilePriority: 'high'
	}
});
