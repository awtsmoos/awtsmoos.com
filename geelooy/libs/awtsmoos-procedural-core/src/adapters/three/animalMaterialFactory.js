// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	createAwtsmoosThreeMaterial
} from "./materialFactory.js";

export function createAnimalThreeMaterials(THREE, materials = [], options = {}) {
	const materialById = new Map();

	for (const materialConfig of materials) {
		const baseColor = materialConfig.base_color || [
			0.7,
			0.7,
			0.7,
			1
		];
		const slots = materialConfig.texture_slots || {};
		const resolveTexture = options.textureResolver || (() => null);
		const material = createAwtsmoosThreeMaterial(THREE, {
			type: materialConfig.type === "principled"
				? "standard"
				: materialConfig.type,
			color: rgbaToHex(baseColor),
			roughness: materialConfig.roughness,
			metalness: materialConfig.metallic,
			transparent: baseColor[3] < 1,
			opacity: baseColor[3],
			map: resolveTexture(slots.base_color),
			normalMap: resolveTexture(slots.normal),
			roughnessMap: resolveTexture(slots.roughness),
			metalnessMap: resolveTexture(slots.metallic),
			aoMap: resolveTexture(slots.ambient_occlusion),
			alphaMap: resolveTexture(slots.alpha)
		});
		material.name = materialConfig.id;
		material.userData.awtsmoosMaterialRegion = materialConfig.id;
		materialById.set(materialConfig.id, material);
	}
	return materialById;
}

function rgbaToHex(color) {
	const channels = color.slice(0, 3).map((value) => {
		return Math.max(0, Math.min(255, Math.round(value * 255)));
	});
	return (
		(channels[0] << 16) |
		(channels[1] << 8) |
		channels[2]
	);
}
