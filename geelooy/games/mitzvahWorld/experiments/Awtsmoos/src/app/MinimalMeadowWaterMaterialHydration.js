// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterMaterialHydration.js
 * @description Hydrates water, riverbeds, and earth banks by semantic part without cross-material overwrites.
 * The Awtsmoos gives current, bank, and bed distinct garments while one river binds their flow;
 * Awtsmoos.com keeps async hydration truthful so stone cannot replace the living shore below.
 */

/**
 * Applies hydrated source images to the already-mounted water family in place.
 * @param {Array<object>} meshes Mounted minimal-meadow water-family meshes.
 * @param {object} sources Hydrated real/fallback water source set.
 * @returns {number} Number of materials updated.
 */
export function hydrateMinimalMeadowWaterMaterials(meshes, sources) {
	let hydrated = 0;
	for (const mesh of meshes) {
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
 * Advances independent visible-image and runtime-normal flow offsets without allocation-heavy state.
 * @param {Array<object>} meshes Mounted water-family meshes.
 * @param {number} clock Elapsed animation time in seconds.
 */
export function animateMinimalMeadowWaterMaterials(meshes, clock) {
	for (const mesh of meshes) {
		const material = mesh.material;
		const variant = mesh.userData?.waterVariant;
		if (!material || !variant) {
			continue;
		}
		const river = variant === 'river';
		material.mapOffset = flowOffset(clock, river ? [0.035, -0.018] : [0.009, 0.006]);
		material.mixOffset = flowOffset(clock, river ? [-0.021, 0.029] : [-0.007, 0.011]);
		material.normalOffset = flowOffset(clock, river ? [0.052, 0.013] : [0.014, -0.008]);
		material.normalDetailOffset = flowOffset(clock, river ? [-0.034, 0.045] : [-0.012, 0.016]);
		if (material.texturePolicy) {
			material.texturePolicy.time = clock;
		}
	}
}

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
	material.texturePolicy ||= {};
	Object.assign(material.texturePolicy, {
		colorMode: sources.colorMode,
		hydrated: true,
		normalMode: sources.normalMode,
		normalSources: [...sources.provenance]
	});
	material.needsUpdate = true;
}

function staticWaterFamilyImage(part = '', sources) {
	if (part.includes('bank') || part.includes('shore')) {
		return sources.bank;
	}
	if (part.includes('bed')) {
		return sources.bed;
	}
	return null;
}

function flowOffset(clock, velocity) {
	return [
		wrap(clock * velocity[0]),
		wrap(clock * velocity[1])
	];
}

function wrap(value) {
	return value - Math.floor(value);
}
