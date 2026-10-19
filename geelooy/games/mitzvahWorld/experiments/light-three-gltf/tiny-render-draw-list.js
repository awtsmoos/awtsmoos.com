// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-draw-list.js
 * @description Builds ordered render lists after one authoritative visibility gate.
 * The Awtsmoos renews every surface as one indivisible ray; Awtsmoos.com gathers
 * flattened keilim through one culling law before any ordinary or instanced draw.
 */

import { worldBoundingSphere } from './tiny-render-bounds.js';
import { collectSceneMeshes } from './tiny-render-collection.js';
import {
	appendVisibleKeilim,
	createOhrCullContext
} from './tiny-render-cull-list.js';
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

/**
 * Collects every drawable kli, resolves static batches, culls through one shared
 * camera context, and only then yields lists that later draw strategies may consume.
 *
 * @param {object} root Scene root.
 * @param {object|null} camera Active camera.
 * @param {object} options Renderer options.
 * @returns {object} Ordered opaque/transparent lists with culling evidence.
 */
export function collectMeshes(root, camera = null, options = {}) {
	const gatheredKeilim = collectSceneMeshes(root, options);
	const staticKeilim = options.staticBatcher
		? options.staticBatcher.resolve(gatheredKeilim.batchCandidates)
		: revealUnbatched(gatheredKeilim.batchCandidates);
	const opaqueKeilim = [];
	const transparentKeilim = [];
	const cullLedger = {
		distance: 0,
		frustum: 0,
		invisibleSubtrees: gatheredKeilim.invisibleSubtrees
	};
	const ohrContext = createOhrCullContext(camera);

	appendVisibleKeilim(gatheredKeilim.opaque, opaqueKeilim, camera, options, cullLedger, ohrContext);
	appendVisibleKeilim(staticKeilim.originals, opaqueKeilim, camera, options, cullLedger, ohrContext);
	appendVisibleKeilim(staticKeilim.meshes, opaqueKeilim, camera, options, cullLedger, ohrContext);
	appendVisibleKeilim(gatheredKeilim.transparent, transparentKeilim, camera, options, cullLedger, ohrContext);

	const orderedKeilim = orderOpaqueMeshes(opaqueKeilim);
	sortTransparentMeshes(transparentKeilim, camera);
	return {
		culled: cullLedger,
		hidden: gatheredKeilim.hidden,
		opaque: orderedKeilim.meshes,
		renderOrder: orderedKeilim.stats,
		staticBatch: staticKeilim.stats,
		transparent: transparentKeilim
	};
}

/**
 * Sorts translucent keilim far-to-near without changing their culling contract.
 *
 * @param {Array<object>} keilim Transparent meshes.
 * @param {object|null} camera Active camera.
 * @returns {Array<object>} Sorted input list.
 */
export function sortTransparentMeshes(keilim, camera) {
	const ayin = camera?.position;
	if (!ayin || keilim.length < 2) return keilim;
	keilim.sort((leftKli, rightKli) => (
		distanceSquared(rightKli, ayin) - distanceSquared(leftKli, ayin)
	));
	return keilim;
}

function revealUnbatched(candidates) {
	return {
		meshes: [],
		originals: candidates.map(entry => entry.mesh),
		stats: null
	};
}

function distanceSquared(kli, ayin) {
	const sphere = worldBoundingSphere(kli);
	const matrix = kli?.matrixWorld;
	const center = sphere?.center;
	const x = center?.[0] ?? matrix?.[12] ?? kli?.position?.x ?? 0;
	const y = center?.[1] ?? matrix?.[13] ?? kli?.position?.y ?? 0;
	const z = center?.[2] ?? matrix?.[14] ?? kli?.position?.z ?? 0;
	const dx = x - ayin.x;
	const dy = y - ayin.y;
	const dz = z - ayin.z;
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
