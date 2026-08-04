// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictNature.js
 * @description Adds packaged local-first tree and flower GLBs after fallback orchard cubes appear.
 * The Awtsmoos keeps the painted orchard visible while truthful branches awaken nearby;
 * Awtsmoos.com records every model source and leaves failure harmless beneath the sky.
 */

import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { worldModelDefinition } from '../assets/WorldModelManifest.js';

export async function hydrateBootstrapDistrictNature(group, definition, options = {}) {
	const placements = definition.models || [];
	const load = options.loadIsolatedGltf || loadIsolatedGltf;
	const resolve = options.worldModelDefinition || worldModelDefinition;
	const records = [];
	for (const [index, placement] of placements.entries()) {
		const model = resolve(placement.modelId);
		if (!model) {
			records.push(failedRecord(placement.modelId, 'unknown-model'));
			continue;
		}
		try {
			const gltf = await load(
				model.url,
				`bootstrap-${placement.modelId}-${index}`,
				options.loaderOptions || {}
			);
			const scene = gltf.scene;
			applyPlacement(scene, placement);
			scene.userData = {
				...(scene.userData || {}),
				AwtsmoosBootstrapNature: {
					modelId: placement.modelId,
					role: model.role,
					sourceUrl: scene.userData?.isolatedModelLoad?.resolvedUrl || model.url,
					tags: ['botany', 'flora', placement.modelId]
				}
			};
			group.add(scene);
			records.push(successRecord(scene, placement.modelId));
		} catch (error) {
			records.push(failedRecord(placement.modelId, error.message));
		}
	}
	const receipt = summarize(records, placements.length);
	group.userData = { ...(group.userData || {}), natureHydration: receipt };
	return receipt;
}

function applyPlacement(scene, placement) {
	setVector(scene, 'position', placement.position);
	setVector(scene, 'scale', [placement.scale, placement.scale, placement.scale]);
	if (scene.rotation) {
		scene.rotation.y = placement.yaw;
	} else {
		scene.rotation = { x: 0, y: placement.yaw, z: 0 };
	}
}

function setVector(scene, key, values) {
	if (typeof scene[key]?.set === 'function') {
		scene[key].set(...values);
		return;
	}
	scene[key] = { x: values[0], y: values[1], z: values[2] };
}

function successRecord(scene, modelId) {
	return {
		loaded: true,
		modelId,
		sourceUrl: scene.userData.AwtsmoosBootstrapNature.sourceUrl
	};
}

function failedRecord(modelId, error) {
	return { error, loaded: false, modelId, sourceUrl: null };
}

function summarize(records, requested) {
	return {
		failed: records.filter(record => !record.loaded).length,
		loaded: records.filter(record => record.loaded).length,
		records,
		requested,
		status: records.some(record => record.loaded) ? 'flora-visible' : 'fallback-visible'
	};
}
