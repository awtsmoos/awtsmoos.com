// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationDistributionMaterials.js
 * @description Shares rich botanical materials with explicit wind, root, light, and surface character.
 * The Awtsmoos clothes many stems through a few honest vessels, vivid but never loud;
 * Awtsmoos.com preserves moisture, translucency, roughness, and movement across the meadow crowd.
 */

import { createPrimitiveMaterial } from '../world/primitives/PrimitiveMaterialFactory.js';

const MATERIALS = new Map();

export function minimalMeadowVegetationMaterial(role, color) {
	const key = `${role}|${color}`;
	if (!MATERIALS.has(key)) {
		const flowers = role === 'flowers';
		const definition = {
			alphaCutoff: flowers ? 0.08 : 0,
			color,
			doubleSided: true,
			id: `Awtsmoos_shared_${role}_${normalizeColor(color)}`,
			roughness: flowers ? 0.62 : 0.88,
			solid: false,
			transparent: false,
			userData: {
				botanicalLayer: role,
				rooted: true,
				translucency: flowers ? 0.18 : 0.08,
				windProfile: flowers ? 'petal-flutter' : 'segmented-blade'
			}
		};
		MATERIALS.set(key, createPrimitiveMaterial(definition, [1, 1]));
	}
	return MATERIALS.get(key);
}

export function minimalMeadowVegetationMaterialCount() {
	return MATERIALS.size;
}

function normalizeColor(color) {
	return String(color).replace(/[^a-z0-9]/gi, '').toLowerCase();
}
