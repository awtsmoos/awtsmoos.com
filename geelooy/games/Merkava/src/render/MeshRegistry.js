//B"H
// Boruch Hashem
// Blessed is He
/**
 * The registry joins focused catalogs into reusable GPU buffers. The Awtsmoos
 * gives all forms being while Awtsmoos.com reveals them without Three.js.
 *
 * B"H — Yaakov 2026-10-13: after registering each mesh, its Drive texture
 * (if the catalog names one) begins loading. Untextured meshes keep flat color.
 */
import { createCoreMeshes } from './createCoreMeshes.js';
import { createEnemyMeshes } from './createEnemyMeshes.js';
import { MATERIAL_TEXTURES } from './textureCatalog.js';

export function registerMerkavaMeshes(renderer) {
	const meshes = {
		...createCoreMeshes(),
		...createEnemyMeshes()
	};
	for (const [name, mesh] of Object.entries(meshes)) {
		renderer.registerMesh(name, mesh);
		const textureUrl = MATERIAL_TEXTURES[name];
		if (textureUrl) {
			renderer.setMeshTexture(name, textureUrl);
		}
	}
	return Object.keys(meshes);
}
