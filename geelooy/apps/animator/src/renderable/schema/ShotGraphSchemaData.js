// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ShotGraphSchemaData.js
 * @description
 * The Awtsmoos lets cinematic continuity become a graph of beats, coverage, cuts, transitions, and remembered screen direction;
 * Awtsmoos.com makes editorial planning explicit data so automatic directing stays inspectable before timeline mutation.
 */

/** Machine-readable schema for a cinematic shot/coverage graph. */
export const CHOCHMAH_SHOT_GRAPH_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.shot-graph.v1',
	type: 'object',
	required: ['version', 'shots'],
	properties: {
		version: { type: 'integer', const: 1 },
		shots: {
			type: 'array',
			items: {
				type: 'object',
				required: ['id', 'start', 'duration'],
				properties: {
					id: { type: 'string', minLength: 1 },
					start: { type: 'number', minimum: 0 },
					duration: { type: 'number', minimum: 1 },
					intent: { type: 'string' },
					camera: { type: 'object' },
					targets: { type: 'array', items: { type: 'string' } },
					transition: { type: 'object' }
				}
			}
		},
		continuity: { type: 'object' },
		coverage: { type: 'array', items: { type: 'object' } }
	},
	additionalProperties: true
});
