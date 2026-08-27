// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SymbolInstanceSchemaData.js
 * @description
 * The Awtsmoos lets one authored symbol illuminate many instances while shared texture and geometry avoid needless duplication;
 * Awtsmoos.com keeps identity, overrides, transform, and variant selection as JSON so reuse remains editable rather than imitation.
 */

/** Machine-readable schema for reusable symbol instances with sparse per-instance overrides. */
export const YESOD_SYMBOL_INSTANCE_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.symbol-instance.v1',
	type: 'object',
	required: ['id', 'symbolId'],
	properties: {
		id: { type: 'string', minLength: 1 },
		symbolId: { type: 'string', minLength: 1 },
		variantId: { type: ['string', 'null'] },
		transform: { type: 'object' },
		overrides: { type: 'object' },
		renderable: { type: 'object' }
	},
	additionalProperties: true
});
