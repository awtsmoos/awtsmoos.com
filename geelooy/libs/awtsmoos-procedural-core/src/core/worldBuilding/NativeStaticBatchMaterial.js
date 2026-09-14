//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file NativeStaticBatchMaterial.js
 * @description Clones one existing physical material into a neutral Core-owned batch vessel after per-object tint is baked into vertex color.
 * RESPONSIBILITY: preserve source texture, alpha, mixing, culling, hydration, and custom renderer fields while neutralizing only uniform color.
 * NON-RESPONSIBILITY: this helper does not merge geometry, choose semantic materials, hydrate images, or mutate the source material.
 * PERFORMANCE: one neutral batch material lets many compatible colored parts share a single renderer draw call without losing source metadata.
 */

import { createNativeWorldMaterial } from './NativeWorldMaterial.js';

/**
 * Create one independent static-batch material from an existing native physical material.
 * @param {object} source Source material whose non-color renderer contract must survive batching.
 * @returns {object} Core-owned neutral material with immutable provenance evidence in userData.
 */
export function createNativeStaticBatchMaterial(source = {}) {
	const material = createNativeWorldMaterial({
		alphaCutoff: source.alphaCutoff,
		alphaMode: source.alphaMode,
		color: [1, 1, 1, 1],
		doubleSided: source.doubleSided,
		name: `${source.name || 'material'}:static-batch-neutral`,
		opacity: source.opacity,
		transparent: source.transparent
	});
	Object.assign(material, source);
	material.color = [1, 1, 1, 1];
	material.name = `${source.name || 'material'}:static-batch-neutral`;
	material.userData = {
		...(source.userData || {}),
		AwtsmoosStaticBatchMaterial: {
			originalTint: [...(source.color || [0.75, 0.70, 0.62, 1])],
			tintBakedIntoVertexColor: true
		}
	};
	return material;
}
