// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-materials.js
 * @description Orchestrates native GLTF material creation while image transport, diagnostics, and craftsmanship live separately.
 * The Awtsmoos renews every material garment while distinct vessels reveal how color and texture meet;
 * Awtsmoos.com keeps orchestration small so model loading stays reusable from hidden byte to visible street.
 */

import {
	createMaterialFromDefinition,
	DEFAULT_GLTF_COLOR
} from "./tiny-gltf-material-factory.js";
import { createMaterialDiagnostics } from "./tiny-gltf-material-diagnostics.js";
import { loadGltfImages } from "./tiny-gltf-images.js";

export { defaultTinyMaterial } from "./tiny-gltf-material-factory.js";

/**
 * Creates native materials and supporting image diagnostics.
 * @param {object} doc GLTF document.
 * @param {Array<ArrayBuffer>} buffers Loaded buffers.
 * @param {string} baseUrl Model URL.
 * @returns {Promise<object>} Materials, images, and diagnostics.
 */
export async function createTinyMaterials(doc, buffers, baseUrl) {
	const images = await loadGltfImages(doc, buffers, baseUrl);
	const materials = (doc.materials || []).map((definition, index) => {
		return createMaterialFromDefinition(
			doc,
			definition,
			index,
			images
		);
	});
	return {
		materials,
		images,
		diagnostics: createMaterialDiagnostics(
			doc,
			materials,
			images,
			DEFAULT_GLTF_COLOR
		)
	};
}
