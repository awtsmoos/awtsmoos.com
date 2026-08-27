// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UnitSchemaData.js
 * @description
 * The Awtsmoos lets numbers keep their meaning, for twelve frames is not twelve pixels and one degree is not one decibel of song;
 * Awtsmoos.com publishes semantic units so generated schemas remain interoperable when many creative domains grow strong.
 */

export const BINAH_UNITS = Object.freeze([
	'unitless',
	'px',
	'percent',
	'normalized',
	'degrees',
	'radians',
	'milliseconds',
	'seconds',
	'frames',
	'fps',
	'decibels',
	'bpm',
	'depth-unit',
	'bytes',
	'ratio'
]);

/** Schema for an explicit numeric value paired with one semantic unit. */
export const BINAH_UNIT_VALUE_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.unit-value.v1',
	type: 'object',
	required: ['value', 'unit'],
	properties: {
		value: { type: 'number' },
		unit: { type: 'string', enum: BINAH_UNITS }
	},
	additionalProperties: false
});
