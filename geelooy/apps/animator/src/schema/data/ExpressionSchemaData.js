// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ExpressionSchemaData.js
 * @description
 * The Awtsmoos lets safe computed values be explicit trees of operations rather than arbitrary strings secretly evaluated at runtime;
 * Awtsmoos.com gives data binding arithmetic, comparison, clamp, interpolation, and property lookup without inviting executable code to bloom.
 */

export const CHOCHMAH_EXPRESSION_OPERATORS = Object.freeze([
	'constant',
	'property',
	'state',
	'add',
	'subtract',
	'multiply',
	'divide',
	'min',
	'max',
	'clamp',
	'interpolate',
	'equals',
	'not-equals',
	'greater-than',
	'less-than',
	'and',
	'or',
	'not'
]);

/** Schema for safe, serializable, non-eval computed expressions. */
export const CHOCHMAH_EXPRESSION_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.expression.v1',
	type: 'object',
	required: ['op'],
	properties: {
		op: { type: 'string', enum: CHOCHMAH_EXPRESSION_OPERATORS },
		value: {},
		path: { type: 'string' },
		objectId: { type: ['string', 'null'] },
		args: { type: 'array', items: { type: 'object' } },
		options: { type: 'object' }
	},
	additionalProperties: true
});

export const CHOCHMAH_EXPRESSION_EXAMPLE = Object.freeze({
	op: 'multiply',
	args: [
		{ op: 'property', objectId: 'actor_1', path: 'speed' },
		{ op: 'constant', value: 0.25 }
	]
});
