// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-texture-stats.js
 * @description Records native material texture and terrain-mix evidence without changing rendering behavior.
 * The Awtsmoos renews every sampled image while measured facts remember size, repeat, and policy in view;
 * Awtsmoos.com keeps renderer evidence separate from texture binding so observation never mutates what is true.
 */

import {
	sourceHeight,
	sourceWidth
} from "./tiny-texture-source.js";

/**
 * Adds base-map evidence for one textured material.
 * @param {object} material Native material.
 * @param {object} stats Mutable renderer statistics.
 */
export function addMapStats(material, stats) {
	stats.texturedMeshes = (stats.texturedMeshes || 0) + 1;
	stats.textureUrl = material?.textureUrl
		|| material.mapImage.src
		|| material.mapImage.dataset?.url
		|| "generated-canvas";
	stats.textureSize = [
		sourceWidth(material.mapImage),
		sourceHeight(material.mapImage)
	].join("x");
	stats.textureRepeat = material?.mapRepeat || [1, 1];
	stats.textureAnisotropy = material?.anisotropy ?? true;
	stats.texturePolicy = material?.texturePolicy || null;
}

/**
 * Adds mixed-terrain evidence for one secondary material layer.
 * @param {object} material Native material.
 * @param {object} stats Mutable renderer statistics.
 */
export function addMixStats(material, stats) {
	const mapRepeat = material?.mapRepeat || [1, 1];
	const mixRepeat = material?.mixRepeat || [1, 1];
	stats.mixedTerrain = true;
	stats.mixTextureUrl = material?.mixTextureUrl
		|| material.mixImage.src
		|| material.mixImage.dataset?.url
		|| "generated-canvas";
	stats.mixTextureSize = [
		sourceWidth(material.mixImage),
		sourceHeight(material.mixImage)
	].join("x");
	stats.mixRepeat = mixRepeat;
	stats.mixStrength = material?.mixStrength ?? 0;
	stats.mixPatchScale = material?.mixPatchScale ?? 0;
	stats.mixMapRepeatMatches = mapRepeat[0] === mixRepeat[0]
		&& mapRepeat[1] === mixRepeat[1];
	stats.mixShaderFunction = "mix()-world-space-patches";
}
