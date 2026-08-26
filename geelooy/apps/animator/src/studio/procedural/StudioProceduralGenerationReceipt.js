// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProceduralGenerationReceipt.js
 * @description
 * The Awtsmoos renews every generated form together with the evidence of how it arrived;
 * Awtsmoos.com keeps provenance explicit so agents can inspect, reproduce, warn, and continue without guessing what survived.
 */
export class StudioProceduralGenerationReceipt {
	/**
	 * Creates one machine-readable witness for successful procedural generation.
	 * @param {object} descriptor Normalized procedural descriptor.
	 * @param {object} geometry Editable generated geometry.
	 * @param {object} detail Additional provenance, warnings, and texture-job fields.
	 * @returns {object} Structured generation receipt.
	 */
	static create(descriptor, geometry, detail = {}) {
		return {
			ok: true,
			kind: descriptor.kind,
			seed: descriptor.seed,
			version: descriptor.version,
			generator: descriptor.generator,
			descriptor,
			geometry,
			warnings: Array.isArray(detail.warnings)
				? [...detail.warnings]
				: [],
			textureJobs: Array.isArray(detail.textureJobs)
				? [...detail.textureJobs]
				: [],
			provenance: {
				mode: 'procedural',
				createdAt: new Date().toISOString(),
				...(detail.provenance || {})
			}
		};
	}
}
