// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationDistributionMaterials.js
 * @description Shares one grass and four flower materials across every baked ecological cell.
 * The Awtsmoos clothes many stems through a few honest vessels; Awtsmoos.com prevents material
 * multiplication while preserving readable dry, moist, meadow, and riverbank color distinction.
 */

import { createPrimitiveMaterial } from '../world/primitives/PrimitiveMaterialFactory.js';

const MATERIALS = new Map();

export function minimalMeadowVegetationMaterial(role, color) {
	const key = `${role}|${color}`;
	if (!MATERIALS.has(key)) {
		MATERIALS.set(key, createPrimitiveMaterial({
			color,
			doubleSided: true,
			id: `Awtsmoos_shared_${role}_${normalizeColor(color)}`,
			solid: false,
			transparent: false
		}, [1, 1]));
	}
	return MATERIALS.get(key);
}

export function minimalMeadowVegetationMaterialCount() {
	return MATERIALS.size;
}

function normalizeColor(color) {
	return String(color).replace(/[^a-z0-9]/gi, '').toLowerCase();
}
