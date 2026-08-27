// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterMaterialHydration.js
 * @description Hydrates water, riverbeds, and earth banks by semantic part without owning frame animation.
 * The Awtsmoos gives current, bank, and bed distinct garments while one river binds their flow;
 * Awtsmoos.com keeps async hydration truthful so stone cannot replace the living shore below.
 */

/**
 * @description Applies hydrated source images to the already-mounted water family in place.
 * @param {Array<object>} meshes Mounted minimal-meadow water-family meshes.
 * @param {object} sources Hydrated real/fallback water source set.
 * @returns {number} Number of materials updated.
 */
export function hydrateMinimalMeadowWaterMaterials(meshes, sources) {
	let hydrated = 0;
	for (let index = 0; index < meshes.length; index += 1) {
		const mesh = meshes[index];
		const material = mesh.material;
		const data = mesh.userData || {};
		if (!material) {
			continue;
		}
		if (data.waterVariant) {
			hydrateWaterMaterial(material, sources);
			hydrated += 1;
			continue;
		}
		if (data.family !== 'minimal-meadow-water') {
			continue;
		}
		const image = staticWaterFamilyImage(data.part, sources);
		if (!image) {
			continue;
		}
		material.mapImage = image;
		material.needsUpdate = true;
		hydrated += 1;
	}
	return hydrated;
}

/**
 * @description Installs the full real/fallback color and dual-normal source stack on one animated water material.
 * @param {object} material Water surface material.
 * @param {object} sources Hydrated water source set.
 * @returns {void}
 */
function hydrateWaterMaterial(material, sources) {
	material.mapImage = sources.color;
	material.mixImage = sources.detail;
	material.normalImage = sources.normalA;
	material.normalDetailImage = sources.normalB;
	material.textureLayers = [
		{ image: sources.color, role: 'water-color', strength: 1 },
		{ image: sources.detail, role: 'seamless-water-detail', strength: 0.56 },
		{ image: sources.normalA, role: 'procedural-current-normal', strength: 1 },
		{ image: sources.normalB, role: 'procedural-micro-ripple-normal', strength: 0.72 }
	];
	if (!material.texturePolicy) {
		material.texturePolicy = {};
	}
	Object.assign(material.texturePolicy, {
		colorMode: sources.colorMode,
		hydrated: true,
		normalMode: sources.normalMode,
		normalSources: [...sources.provenance]
	});
	material.needsUpdate = true;
}

/**
 * @description Resolves the matching static bank or bed image for a non-water family part.
 * @param {string} part Semantic water-family part name.
 * @param {object} sources Hydrated source set.
 * @returns {object|null} Matching image source or null.
 */
function staticWaterFamilyImage(part = '', sources) {
	if (part.includes('bank') || part.includes('shore')) {
		return sources.bank;
	}
	if (part.includes('bed')) {
		return sources.bed;
	}
	return null;
}
