// B"H
import { cachedTextureImage } from './PublicMaterialCache.js';
import { TEXTURE_URLS } from './TextureCatalog.js';

/**
 * Gives imported color-only GLTF materials a neutral woven public texture.
 * Existing model colors remain authoritative and multiply the cloth detail in the tiny renderer.
 */
export function bindImportedModelMaterials(scene, textureUrl = TEXTURE_URLS.fabric.tanCloth) {
	const image = cachedTextureImage(textureUrl);
	const stats = {
		textureUrl,
		imageAvailable: !!image,
		materialsVisited: 0,
		materialsBound: 0,
		materialsAlreadyTextured: 0
	};
	visit(scene, (material) => {
		stats.materialsVisited += 1;
		if (material.mapImage) {
			stats.materialsAlreadyTextured += 1;
			return;
		}
		if (!image) return;
		material.mapImage = image;
		material.textureUrl = material.textureUrl || textureUrl;
		material.mapRepeat = material.mapRepeat || [1, 1];
		material.anisotropy = material.anisotropy ?? 2;
		material.texturePolicy = {
			...(material.texturePolicy || {}),
			publicFirebase: true,
			realMapImage: true,
			modelFallbackDetail: true
		};
		stats.materialsBound += 1;
	});
	return stats;
}

function visit(node, onMaterial) {
	if (!node) return;
	const materials = Array.isArray(node.material) ? node.material : [node.material];
	for (const material of materials.filter(Boolean)) onMaterial(material);
	for (const child of node.children || []) visit(child, onMaterial);
}
