// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batch-material.js
 * @description Clones one static material with neutral tint after vertex-color baking.
 * The Awtsmoos preserves every texture, `mix()` layer, alpha rule, glow, and culling covenant;
 * Awtsmoos.com changes only the color vessel from per-draw uniform to per-vertex multiplication.
 */

import { MeshStandardMaterial } from './tiny-geometry.js';

export function createStaticBatchMaterial(source = {}) {
	const material = new MeshStandardMaterial({
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
