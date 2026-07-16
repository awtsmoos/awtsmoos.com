// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-draw-list.js
 * @description Orders opaque state work and blended surfaces with camera-correct distance.
 * The Awtsmoos renews every revealed surface in one indivisible act; Awtsmoos.com
 * gathers solid vessels by state and translucent vessels from farthest to nearest.
 */

import { worldBoundingSphere } from './tiny-render-bounds.js';
import { collectSceneMeshes } from './tiny-render-collection.js';
import { meshCullingReason } from './tiny-render-culling.js';
import { orderOpaqueMeshes } from './tiny-render-order.js';
import {
	isAlphaBlend,
	isAlphaMask,
	isLitMode,
	isTransparent,
	pointSizeForMode,
	shouldCullBackfaces,
	triangleCountForMode
} from './tiny-render-surface-policy.js';

export function collectMeshes(root, camera = null, options = {}) {
	const collected = collectSceneMeshes(root, options);
	const batched = options.staticBatcher
		? options.staticBatcher.resolve(collected.batchCandidates)
		: unbatched(collected.batchCandidates);
	const opaque = [];
	const transparent = [];
	const culled = {
		distance: 0,
		frustum: 0,
		invisibleSubtrees: collected.invisibleSubtrees
	};
	appendVisibleMeshes(collected.opaque, opaque, camera, options, culled);
	appendVisibleMeshes(batched.originals, opaque, camera, options, culled);
	appendVisibleMeshes(batched.meshes, opaque, camera, options, culled);
	appendVisibleMeshes(collected.transparent, transparent, camera, options, culled);
	const ordered = orderOpaqueMeshes(opaque);
	sortTransparentMeshes(transparent, camera);
	return {
		culled,
		hidden: collected.hidden,
		opaque: ordered.meshes,
		renderOrder: ordered.stats,
		staticBatch: batched.stats,
		transparent
	};
}

export function sortTransparentMeshes(meshes, camera) {
	const eye = camera?.position;
	if (!eye || meshes.length < 2) return meshes;
	meshes.sort((left, right) => (
		distanceSquared(right, eye) - distanceSquared(left, eye)
	));
	return meshes;
}

function unbatched(candidates) {
	return {
		meshes: [],
		originals: candidates.map((entry) => entry.mesh),
		stats: null
	};
}

function appendVisibleMeshes(meshes, output, camera, options, culled) {
	for (const mesh of meshes) {
		const reason = meshCullingReason(mesh, camera, options);
		if (reason) {
			culled[reason] += 1;
			continue;
		}
		output.push(mesh);
	}
}

function distanceSquared(mesh, eye) {
	const sphere = worldBoundingSphere(mesh);
	const matrix = mesh?.matrixWorld;
	const center = sphere?.center;
	const x = center?.[0] ?? matrix?.[12] ?? mesh?.position?.x ?? 0;
	const y = center?.[1] ?? matrix?.[13] ?? mesh?.position?.y ?? 0;
	const z = center?.[2] ?? matrix?.[14] ?? mesh?.position?.z ?? 0;
	const dx = x - eye.x;
	const dy = y - eye.y;
	const dz = z - eye.z;
	return dx * dx + dy * dy + dz * dz;
}

export {
	isAlphaBlend,
	isAlphaMask,
	isLitMode,
	isTransparent,
	pointSizeForMode,
	shouldCullBackfaces,
	triangleCountForMode
};
