// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RelationshipSchemaData.js
 * @description
 * The Awtsmoos lets objects know who contains, follows, masks, observes, speaks to, or depends upon whom without confusing that meaning with render nesting;
 * Awtsmoos.com keeps semantic relationships explicit so dependency graphs, direction, preflight, and future collaboration share one beginning.
 */

export const DAAS_RELATIONSHIP_KINDS = Object.freeze([
	'parent-of',
	'contains',
	'owns',
	'follows',
	'looks-at',
	'attached-to',
	'speaks-to',
	'depends-on',
	'instance-of',
	'variant-of',
	'controls',
	'masks',
	'illuminates',
	'collides-with',
	'narrates',
	'belongs-to-scene'
]);

/** Schema for one directional semantic relationship between authored things. */
export const DAAS_RELATIONSHIP_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.relationship.v1',
	type: 'object',
	required: ['kind', 'targetId'],
	properties: {
		id: { type: 'string' },
		kind: { type: 'string' },
		targetId: { type: 'string', minLength: 1 },
		label: { type: 'string' },
		weight: { type: 'number' },
		enabled: { type: 'boolean' },
		metadata: { type: 'object' }
	},
	additionalProperties: true
});

export const DAAS_RELATIONSHIP_EXAMPLE = Object.freeze({
	id: 'mira-door-gaze',
	kind: 'looks-at',
	targetId: 'doorway_1',
	enabled: true,
	weight: 1
});
