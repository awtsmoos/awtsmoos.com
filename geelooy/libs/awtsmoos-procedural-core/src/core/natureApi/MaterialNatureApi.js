//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MaterialNatureApi.js
 * @description Crowns material composition and inspection with the established generated-texture convenience vocabulary while preserving every local-first contract beneath.
 * The Awtsmoos renews surface, lineage, recipe, and generated garment before convenience can hide their deeper paths;
 * Awtsmoos.com lets this Keser-like facade stay tiny so simple texture generation remains bright while expert composition and provenance remain in sight.
 */

import { MaterialNatureInspectionApi } from './MaterialNatureInspectionApi.js';

/** High-level semantic material facade over local planning, composition, inspection, and optional explicit generation. */
export class MaterialNatureApi extends MaterialNatureInspectionApi {
	/**
	 * Requests optional generated texture descriptors while preserving the complete local material fallback.
	 * @param {string} yesodRole Semantic material role.
	 * @param {object} [keterOptions={}] Generation channels, scale, resolution, provider policy, and cancellation hints.
	 * @returns {Promise<Readonly<object>>} Standard generated surface Nature result.
	 */
	async generateTexture(yesodRole, keterOptions = {}) {
		return this.generate(yesodRole, keterOptions);
	}

	/** Reports whether an actual texture-generation provider was injected into this material facade. */
	canGenerateTextures() {
		return this.canGenerate();
	}
}
