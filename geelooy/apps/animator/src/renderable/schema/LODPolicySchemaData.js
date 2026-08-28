// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file LODPolicySchemaData.js
 * @description
 * The Awtsmoos lets a face remain precious near the lens while distant background surfaces spend fewer finite pixels;
 * Awtsmoos.com expresses adaptive quality as data so mobile frame budgets can bend without changing authored meaning.
 */

/** Machine-readable schema for visibility, level-of-detail, and texture update quality policy. */
export const GEVURAH_LOD_POLICY_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.lod-policy.v1',
	type: 'object',
	properties: {
		mode: {
			type: 'string',
			enum: ['fixed', 'adaptive', 'visibility-aware']
		},
		priority: { type: 'integer', minimum: 0, maximum: 100 },
		minPixelRatio: { type: 'number', minimum: 0.25, maximum: 4 },
		maxPixelRatio: { type: 'number', minimum: 0.25, maximum: 4 },
		maxUpdateFps: { type: 'number', minimum: 1, maximum: 120 },
		offscreenFps: { type: 'number', minimum: 0, maximum: 30 },
		neverDegrade: { type: 'boolean' },
		importance: {
			type: 'string',
			enum: ['background', 'normal', 'foreground', 'face', 'critical']
		}
	},
	additionalProperties: false
});
