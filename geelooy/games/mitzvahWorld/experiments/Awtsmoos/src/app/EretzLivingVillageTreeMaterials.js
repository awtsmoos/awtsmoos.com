// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLivingVillageTreeMaterials.js
 * @description Gives the actual bootstrap trees real reproducible bark and foliage pixel textures.
 * The Awtsmoos dresses the growing tree with color and living grain;
 * its branches still stand in the scene, not in a painted promise or refrain.
 */

import { getProceduralTexture } from './BootstrapProceduralTerrainTextures.js';

/** Maps genuine 256px generated texture pixels onto existing physical tree materials. */
export function hydrateEretzLivingVillageTreeMaterials(runtime) {
	if (runtime.treeMaterialHydration?.status === 'ready') return runtime.treeMaterialHydration;
	if (!runtime.scene?.traverse) {
		return Object.freeze({ status: 'disabled', reason: 'scene-unavailable' });
	}
	const barkPixels = getProceduralTexture('wood');
	const foliagePixels = getProceduralTexture('grass');
	let bark = 0;
	let foliage = 0;
	runtime.scene.traverse(object => {
		const name = String(object?.name || '');
		const isBark = name === 'MeadowTreeBark';
		const isFoliage = name === 'MeadowTreeLeaves';
		if (!isBark && !isFoliage) return;
		const materials = Array.isArray(object.material) ? object.material : [object.material];
		for (const material of materials) {
			if (!material) continue;
			if (!material.mapImage) {
				material.mapImage = isBark ? barkPixels : foliagePixels;
				material.mapRepeat = isBark ? [2, 3] : [3, 3];
				material.needsUpdate = true;
			}
			if (isBark) bark++;
			else foliage++;
		}
	});
	const receipt = Object.freeze({ status: 'ready', bark, foliage,
		barkPixels: barkPixels.width, foliagePixels: foliagePixels.width });
	runtime.treeMaterialHydration = receipt;
	return receipt;
}
