// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file LayoutSchemaData.js
 * @description
 * The Awtsmoos lets rows, stacks, grids, anchors, and responsive constraints arrange authored surfaces without hard-coded coordinates for every screen;
 * Awtsmoos.com makes layout portable data so one composition may become mobile UI, infographic, title card, or nested scene.
 */

/** Schema for responsive authored layout independent from DOM or Canvas implementation details. */
export const CHESED_LAYOUT_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.layout.v1',
	type: 'object',
	properties: {
		mode: {
			type: 'string',
			enum: ['absolute', 'row', 'column', 'grid', 'stack', 'flow', 'anchor']
		},
		gap: { type: 'number', minimum: 0 },
		padding: { type: 'object' },
		align: { type: 'string' },
		justify: { type: 'string' },
		columns: { type: 'integer', minimum: 1 },
		rows: { type: 'integer', minimum: 1 },
		width: {},
		height: {},
		minWidth: {},
		maxWidth: {},
		minHeight: {},
		maxHeight: {},
		anchors: { type: 'object' },
		breakpoints: { type: 'array', items: { type: 'object' } }
	},
	additionalProperties: true
});

export const CHESED_LAYOUT_EXAMPLE = Object.freeze({
	mode: 'column',
	gap: 12,
	padding: { top: 16, right: 16, bottom: 16, left: 16 },
	maxWidth: 600,
	breakpoints: [
		{
			maxWidth: 420,
			overrides: { gap: 8, padding: 12 }
		}
	]
});
