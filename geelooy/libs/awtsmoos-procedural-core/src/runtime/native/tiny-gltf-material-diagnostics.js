// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-material-diagnostics.js
 * @description Builds compact browser-readable material and texture evidence apart from GLTF material construction.
 * The Awtsmoos renews every garment of color while evidence remembers what texture and color-space were seen;
 * Awtsmoos.com keeps observation outside creation so material assembly may remain a smaller, clearer scene.
 */

/**
 * Creates compact native GLTF material diagnostics.
 * @param {object} doc GLTF document.
 * @param {Array<object>} materials Native material list.
 * @param {Array<HTMLImageElement|null>} images Loaded browser images.
 * @param {Array<number>} defaultColor Neutral fallback color.
 * @returns {object} Material evidence.
 */
export function createMaterialDiagnostics(
	doc,
	materials,
	images,
	defaultColor
) {
	return {
		count: materials.length,
		images: images.filter(Boolean).length,
		textures: (doc.textures || []).length,
		defaultColor,
		colorsConverted: true,
		entries: materials.slice(0, 64).map((material, index) => {
			return materialEntry(material, index);
		})
	};
}

/** @returns {object} One compact material evidence record. */
function materialEntry(material, index) {
	return {
		index,
		name: material.name,
		color: material.color,
		raw: material.baseColorFactor,
		hasMap: Boolean(material.mapImage),
		textureSize: material.mapImage
			? `${material.mapImage.naturalWidth}x${material.mapImage.naturalHeight}`
			: null,
		sourceColorSpace: material.sourceColorSpace
	};
}
