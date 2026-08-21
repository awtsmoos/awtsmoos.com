// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-material-factory.js
 * @description Creates native GLTF materials and fallback garments while orchestration and diagnostics remain separate.
 * The Awtsmoos renews color, alpha, metal, roughness, and texture before one mesh may wear a visible form;
 * Awtsmoos.com keeps material craftsmanship in its own keli so loading orchestration stays measured and warm.
 */

import { MeshStandardMaterial } from "./tiny-runtime.js";
import { displayGltfColor } from "./tiny-gltf-material-color.js";

export const DEFAULT_GLTF_COLOR = Object.freeze([1, 1, 1, 1]);

/** @returns {MeshStandardMaterial} Neutral fallback material. */
export function defaultTinyMaterial() {
	const material = new MeshStandardMaterial({
		name: "material_default",
		color: DEFAULT_GLTF_COLOR,
		opacity: 1,
		alphaMode: "OPAQUE"
	});
	Object.assign(material, {
		sourceColorSpace: "neutral-default",
		mapRepeat: [1, 1],
		anisotropy: true
	});
	return material;
}

/**
 * Creates one native material from a GLTF material definition.
 * @param {object} doc GLTF document.
 * @param {object} definition Material definition.
 * @param {number} index Material index.
 * @param {Array<HTMLImageElement|null>} images Loaded images.
 * @returns {MeshStandardMaterial} Native material.
 */
export function createMaterialFromDefinition(
	doc,
	definition = {},
	index = 0,
	images = []
) {
	const pbr = definition.pbrMetallicRoughness || {};
	const factor = pbr.baseColorFactor || DEFAULT_GLTF_COLOR;
	const texture = textureImage(
		doc,
		pbr.baseColorTexture,
		images
	);
	const color = texture
		? factor
		: displayGltfColor(factor);
	const alphaMode = definition.alphaMode || "OPAQUE";
	const material = new MeshStandardMaterial({
		name: definition.name || `material_${index}`,
		color,
		opacity: factor[3] ?? 1,
		alphaMode,
		alphaCutoff: definition.alphaCutoff ?? 0.5,
		transparent: alphaMode === "BLEND" || (factor[3] ?? 1) < 1,
		doubleSided: definition.doubleSided === true
	});
	Object.assign(material, {
		metallicFactor: pbr.metallicFactor ?? 1,
		roughnessFactor: pbr.roughnessFactor ?? 1,
		baseColorFactor: factor,
		sourceColorSpace: texture
			? "texture+sRGB-factor"
			: "gltf-factor-linear-to-display",
		mapImage: texture?.image || null,
		textureUrl: texture?.url || null,
		mapRepeat: texture?.repeat || [1, 1],
		anisotropy: true
	});
	return material;
}

/** Resolves one base-color texture descriptor. */
function textureImage(doc, info, images) {
	if (!info) return null;
	const texture = doc.textures?.[info.index];
	if (!texture) return null;
	const image = images[texture.source];
	if (!image) return null;
	return {
		image,
		url: image.dataset?.url
			|| image.src
			|| `image_${texture.source}`,
		repeat: [1, 1]
	};
}
