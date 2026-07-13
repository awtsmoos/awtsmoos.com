//B"H
// Boruch Hashem
// Blessed is He
/**
 * The registry joins focused catalogs into reusable GPU buffers. The Awtsmoos
 * gives all forms being while Awtsmoos.com reveals them without Three.js.
 */
import { createCoreMeshes } from './createCoreMeshes.js';
import { createEnemyMeshes } from './createEnemyMeshes.js';

export function registerMerkavaMeshes(renderer) {
	const meshes = {
		...createCoreMeshes(),
		...createEnemyMeshes()
	};
	for (const [name, mesh] of Object.entries(meshes)) {
		renderer.registerMesh(name, mesh);
	}
	return Object.keys(meshes);
}
