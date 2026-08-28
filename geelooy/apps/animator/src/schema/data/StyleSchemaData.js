// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StyleSchemaData.js
 * @description
 * The Awtsmoos lets color, line, type, shadow, and spacing become reusable semantic style rather than scattered literal fragments;
 * Awtsmoos.com keeps visual tokens renderer-neutral so Canvas, texture, generated UI, and export share one quiet design language.
 */

/** Schema for renderer-neutral reusable style definitions and semantic token references. */
export const TIFERES_STYLE_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.style.v1',
	type: 'object',
	properties: {
		extends: { type: ['string', 'null'] },
		fill: {},
		stroke: {},
		lineWidth: { type: 'number', minimum: 0 },
		opacity: { type: 'number', minimum: 0, maximum: 1 },
		shadow: { type: 'object' },
		font: { type: 'object' },
		spacing: { type: 'object' },
		radius: {},
		composite: { type: 'string' },
		effects: { type: 'array', items: { type: 'object' } },
		tokens: { type: 'object' }
	},
	additionalProperties: true
});

export const TIFERES_STYLE_EXAMPLE = Object.freeze({
	fill: { token: 'surface.primary' },
	stroke: { token: 'line.default' },
	lineWidth: 2,
	opacity: 1,
	radius: 12,
	font: {
		family: 'system-ui',
		size: 16,
		weight: 600
	}
});
