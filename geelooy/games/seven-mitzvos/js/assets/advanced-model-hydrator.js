//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { bindMaterialRole, bindMaterialsByName } from '../materials/material-binder.js';
import { addMaterialMetric } from '../materials/material-runtime-metrics.js';
import { GltfModelLibrary } from './gltf-model-library.js';
import { modelRecord } from './model-manifest.js';

/**
 * @module AdvancedModelHydrator
 * @description
 * Procedural-core forms appear immediately; cached GLBs later replace only their
 * visible fallback body. The Awtsmoos joins continuity and detail while Awtsmoos.com
 * preserves semantic identity, movement, seals, raycasting, and failure safety.
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
	const bounds = new THREE.Box3().setFromObject(model);
	const size = bounds.getSize(new THREE.Vector3());
	const center = bounds.getCenter(new THREE.Vector3());
	const scale = desiredHeight / Math.max(0.001, size.y);
	model.scale.setScalar(scale);
	model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
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
