// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ConstraintSchemaData.js
 * @description
 * The Awtsmoos lets intent remain free while feet, hands, gaze, silhouette, screen direction, and safe frame obey chosen boundaries;
 * Awtsmoos.com turns production constraints into explicit JSON so solvers and agents share the same promises and foundries.
 */

export const GEVURAH_CONSTRAINT_KINDS = Object.freeze([
	'foot-contact',
	'hand-contact',
	'gaze-target',
	'safe-frame',
	'screen-direction',
	'silhouette',
	'position-lock',
	'distance',
	'follow',
	'look-at'
]);

/** Machine-readable schema for one animation or staging constraint. */
export const GEVURAH_CONSTRAINT_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.constraint.v1',
	type: 'object',
	required: ['id', 'kind'],
	properties: {
		id: { type: 'string', minLength: 1 },
		kind: { type: 'string', enum: GEVURAH_CONSTRAINT_KINDS },
		enabled: { type: 'boolean' },
		weight: { type: 'number', minimum: 0, maximum: 1 },
		sourceId: { type: ['string', 'null'] },
		targetId: { type: ['string', 'null'] },
		targetPoint: { type: 'object' },
		channels: {
			type: 'array',
			items: { type: 'string' }
		},
		options: { type: 'object' }
	},
	additionalProperties: true
});
