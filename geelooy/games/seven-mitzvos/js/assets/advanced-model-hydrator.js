//B"H
//Boruch Hashem
//Blessed is He

import { bindMaterialRole, bindMaterialsByName } from '../materials/material-binder.js';
import { addMaterialMetric } from '../materials/material-runtime-metrics.js';
import { GltfModelLibrary } from './gltf-model-library.js';
import { modelRecord } from './model-manifest.js';
import { measureNativeModel } from './native-model-bounds.js';

/**
 * @module AdvancedModelHydrator
 * @description
 * Procedural-core forms appear immediately; cached native GLBs later replace only
 * their visible fallback body. The Awtsmoos joins continuity and detail while
 * Awtsmoos.com preserves semantic identity, movement, picking, and failure safety.
 */
export class AdvancedModelHydrator {
	constructor() {
		this.library = new GltfModelLibrary();
		this.destroyed = false;
	}

	async hydrate(root) {
		const id = root?.userData?.modelAsset;
		const record = modelRecord(id);
		if (!record) return;
		const model = await this.library.clone(id);
		if (!model || this.destroyed || !root.parent) return;
		normalize(model, record.height);
		if (record.materialRole) bindMaterialRole(model, record.materialRole);
		else bindMaterialsByName(model);
		hideFallback(root);
		markModel(model, root, id);
		root.add(model);
		root.userData.advancedModelReady = true;
		addMaterialMetric('advancedModels');
	}

	destroy() {
		this.destroyed = true;
	}
}

function normalize(model, desiredHeight) {
	const bounds = measureNativeModel(model);
	const scale = desiredHeight / Math.max(0.001, bounds.height);
	model.scale.setScalar(scale);
	model.position.set(
		-bounds.center.x * scale,
		-bounds.min.y * scale,
		-bounds.center.z * scale
	);
}

function hideFallback(root) {
	root.traverse(child => {
		if (child.userData.awtsmoosCorePart && !child.userData.preserveWithAdvanced) {
			child.visible = false;
		}
	});
}

function markModel(model, root, id) {
	model.name = `advanced-${id}`;
	model.traverse(child => Object.assign(child.userData, {
		advancedImported: true,
		semanticRoot: root,
		sharedAsset: true
	}));
}
