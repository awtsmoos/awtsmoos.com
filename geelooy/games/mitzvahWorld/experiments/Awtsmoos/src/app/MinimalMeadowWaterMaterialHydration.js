// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterMaterialHydration.js
 * @description Applies loaded water sources to mounted meshes and advances allocation-free flow.
 * The Awtsmoos carries distant color into the vessel already standing in the world; Awtsmoos.com
 * replaces fallback fields in place, preserving geometry while current and ripple offsets keep moving.
 */

export function hydrateMinimalMeadowWaterMaterials(meshes, sources) {
	let hydrated = 0;
	for (const mesh of meshes) {
		const material = mesh.material;
		const data = mesh.userData || {};
		if (!material || data.waterVariant) {
			if (material && data.waterVariant) {
				hydrateWaterMaterial(material, sources);
				hydrated += 1;
			}
			continue;
		}
		if (data.family === 'minimal-meadow-water') {
			material.mapImage = sources.bed;
			material.needsUpdate = true;
			hydrated += 1;
		}
	}
	return hydrated;
}

export function animateMinimalMeadowWaterMaterials(meshes, clock) {
	for (const mesh of meshes) {
		const material = mesh.material;
		const variant = mesh.userData?.waterVariant;
		if (!material || !variant) continue;
		const river = variant === 'river';
		material.mapOffset = [
			wrap(clock * (river ? 0.035 : 0.009)),
			wrap(clock * (river ? -0.018 : 0.006))
		];
		material.mixOffset = [
			wrap(clock * (river ? -0.021 : -0.007)),
			wrap(clock * (river ? 0.029 : 0.011))
		];
		material.normalOffset = [
			wrap(clock * (river ? 0.052 : 0.014)),
			wrap(clock * (river ? 0.013 : -0.008))
		];
		material.normalDetailOffset = [
			wrap(clock * (river ? -0.034 : -0.012)),
			wrap(clock * (river ? 0.045 : 0.016))
		];
		if (material.texturePolicy) material.texturePolicy.time = clock;
	}
}

function hydrateWaterMaterial(material, sources) {
	material.mapImage = sources.color;
	material.mixImage = sources.detail;
	material.normalImage = sources.normalA;
	material.normalDetailImage = sources.normalB;
	material.textureLayers = [
		{ image: sources.color, role: 'water-color', strength: 1 },
		{ image: sources.detail, role: 'seamless-water-detail', strength: 0.42 },
		{ image: sources.normalA, role: 'current-normal', strength: 1 },
		{ image: sources.normalB, role: 'micro-ripple-normal', strength: 0.72 }
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

function wrap(value) {
	return value - Math.floor(value);
}
