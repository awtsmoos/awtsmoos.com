// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-draw-list.js
 * @description Collects visible meshes and orders opaque work without changing pixels.
 * The Awtsmoos renews every revealed surface in one indivisible act; Awtsmoos.com
 * gathers equal shader vessels together so the same valley appears with fewer stalls.
 */

import { collectSceneMeshes } from './tiny-render-collection.js';
import { meshCullingReason } from './tiny-render-culling.js';
import {
	isLitMode,
	isTransparent,
	pointSizeForMode,
	triangleCountForMode
} from './tiny-render-surface-policy.js';

const materialOrder = new WeakMap();
let nextMaterialOrder = 1;

export function collectMeshes(root, camera = null, options = {}) {
	const collected = collectSceneMeshes(root, options);
	const batched = options.staticBatcher
		? options.staticBatcher.resolve(collected.batchCandidates)
		: {
			meshes: [],
			originals: collected.batchCandidates.map(entry => entry.mesh),
			stats: null
		};
	const opaque = [];
	const transparent = [];
	const culled = {
		distance: 0,
		frustum: 0,
		invisibleSubtrees: collected.invisibleSubtrees
	};
	for (const mesh of [
		...collected.opaque,
		...batched.originals,
		...batched.meshes
	]) appendVisible(mesh, opaque, camera, options, culled);
	for (const mesh of collected.transparent) {
		appendVisible(mesh, transparent, camera, options, culled);
	}
	opaque.sort(compareOpaqueMeshes);
	return {
		culled,
		hidden: collected.hidden,
		opaque,
		staticBatch: batched.stats,
		transparent
	};
}

function appendVisible(mesh, output, camera, options, culled) {
	const reason = meshCullingReason(mesh, camera, options);
	if (reason) culled[reason] += 1;
	else output.push(mesh);
}

function compareOpaqueMeshes(left, right) {
	return programRank(left) - programRank(right)
		|| cullRank(left) - cullRank(right)
		|| objectOrder(left.material) - objectOrder(right.material);
}

function programRank(mesh) {
	return mesh.isSkinnedMesh && mesh.skeleton ? 1 : 0;
}

function cullRank(mesh) {
	return mesh.material?.backfaceCull ? 0 : 1;
}

function objectOrder(material) {
	if (!material || typeof material !== 'object') return 0;
	if (!materialOrder.has(material)) {
		materialOrder.set(material, nextMaterialOrder);
		nextMaterialOrder += 1;
	}
	return materialOrder.get(material);
}

export {
	isLitMode,
	isTransparent,
	pointSizeForMode,
	triangleCountForMode
};
