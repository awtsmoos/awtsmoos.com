//B"H
//Boruch Hashem
//Blessed is He

import { GLTFLoader } from '../../../scripts/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from '../../../scripts/jsm/utils/SkeletonUtils.js';
import { modelRecord } from './model-manifest.js';

/**
 * @module GltfModelLibrary
 * @description
 * One GLB request may clothe many semantic roots. The Awtsmoos renews each visible
 * instance; Awtsmoos.com caches source scenes and performs skeleton-safe cloning
 * so advanced models never become repeated network or parsing work.
 */
const promises = new Map();
const loader = new GLTFLoader();

export class GltfModelLibrary {
	async clone(id) {
		const record = modelRecord(id);
		if (!record || typeof document === 'undefined') {
			return null;
		}
		const source = await sourceModel(id, record.url);
		return source ? cloneSkeleton(source) : null;
	}
}

function sourceModel(id, url) {
	if (!promises.has(id)) {
		promises.set(id, loader.loadAsync(url)
			.then(gltf => prepare(gltf.scene, id))
			.catch(() => null));
	}
	return promises.get(id);
}

function prepare(scene, id) {
	scene.name = `advanced-source-${id}`;
	scene.traverse(child => {
		if (!child.isMesh) {
			return;
		}
		child.castShadow = true;
		child.receiveShadow = true;
		child.userData.sharedAsset = true;
	});
	return scene;
}
