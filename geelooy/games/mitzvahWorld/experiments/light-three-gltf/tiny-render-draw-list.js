// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-draw-list.js
 * @description Collects visible meshes and orders opaque work by exact GPU-visible state.
 * The Awtsmoos renews every revealed surface in one indivisible act; Awtsmoos.com
 * gathers equal shader vessels together so the same valley appears with fewer stalls.
 */

import { collectSceneMeshes } from './tiny-render-collection.js';
import { meshCullingReason } from './tiny-render-culling.js';
import { orderOpaqueMeshes } from './tiny-render-order.js';
import {
	isLitMode,
	isTransparent,
	pointSizeForMode,
	triangleCountForMode
} from './tiny-render-surface-policy.js';

export function collectMeshes(root, camera = null, options = {}) {
	const collected = collectSceneMeshes(root, options);
	const batched = options.staticBatcher
		? options.staticBatcher.resolve(collected.batchCandidates)
		: {
			meshes: [],
			originals: collected.batchCandidates.map((entry) => entry.mesh),
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
	]) {
		appendVisible(mesh, opaque, camera, options, culled);
	}
	for (const mesh of collected.transparent) {
		appendVisible(mesh, transparent, camera, options, culled);
	}
	const ordered = orderOpaqueMeshes(opaque);
	return {
		culled,
		hidden: collected.hidden,
		opaque: ordered.meshes,
		renderOrder: ordered.stats,
		staticBatch: batched.stats,
		transparent
	};
}

function appendVisible(mesh, output, camera, options, culled) {
	const reason = meshCullingReason(mesh, camera, options);
	if (reason) {
		culled[reason] += 1;
		return;
	}
	output.push(mesh);
}

export {
	isLitMode,
	isTransparent,
	pointSizeForMode,
	triangleCountForMode
};
