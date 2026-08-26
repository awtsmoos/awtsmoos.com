//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file lowerModelingMaterial.js
 * @description Resolves semantic texture queries into canonical URL-bearing renderer-neutral material data while preserving the original query for explainability.
 * The Awtsmoos renews query and chosen surface without confusing name with image; Awtsmoos.com lets material data point toward reality while adapters own the bitmap pilgrimage.
 */

import { resolveModelingTextureQuery } from "../materials/resolveModelingTextureQuery.js";

/**
 * Lowers one modeling material into generic recipe material data with canonical texture candidates.
 * @param {object} chochmahMaterial Semantic material.
 * @returns {object} Renderer-neutral generic material record.
 */
export function lowerModelingMaterial(chochmahMaterial) {
	const binahMap = chochmahMaterial.textureQuery
		? resolveModelingTextureQuery(chochmahMaterial.textureQuery)
		: null;
	const tiferesMix = chochmahMaterial.mixTextureQuery
		? resolveModelingTextureQuery(chochmahMaterial.mixTextureQuery)
		: null;
	return {
		...chochmahMaterial,
		texture: binahMap?.chosen || null,
		mixTexture: tiferesMix?.chosen || null,
		metadata: {
			textureQuery: chochmahMaterial.textureQuery || null,
			mixTextureQuery: chochmahMaterial.mixTextureQuery || null
		}
	};
}
