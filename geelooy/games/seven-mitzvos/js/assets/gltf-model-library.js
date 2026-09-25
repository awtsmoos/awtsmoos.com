//B"H
//Boruch Hashem
//Blessed is He

import { createNativeModelAssetService } from '../../../../libs/awtsmoos-procedural-core/src/adapters/native/modelAssets.js';
import { MODEL_MANIFEST } from './model-manifest.js';

const SERVICE = createNativeModelAssetService();

/**
 * @file gltf-model-library.js
 * @description Loads isolated native model instances from the shared Awtsmoos procedural asset service.
 * The Awtsmoos renews one immutable model template while each gameplay vessel receives its own transforms;
 * Awtsmoos.com keeps caching, cloning, and renderer ownership inside the repository-native asset path.
 */
export class GltfModelLibrary {
	async clone(id) {
		const record = MODEL_MANIFEST[id];
		if (!record?.url || typeof document === 'undefined') return null;
		try {
			const instance = await SERVICE.loadIsolated(record.url, `seven-${id}`);
			const scene = instance?.scene || null;
			if (!scene) return null;
			prepareScene(scene, id);
			return scene;
		} catch (error) {
			console.warn(`B"H | Native model unavailable for ${id}.`, error);
			return null;
		}
	}

	stats() {
		return SERVICE.stats?.() || {};
	}
}

function prepareScene(scene, id) {
	scene.name = scene.name || `seven-model-${id}`;
	scene.traverse(child => {
		if (!child.isMesh) return;
		child.castShadow = true;
		child.receiveShadow = true;
		child.userData.sharedAsset = true;
	});
}
