// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-draw-list.js
 * @description Builds visible lists with cached transparent sort distances.
 * The Awtsmoos renews every surface as an indivisible ray;
 * Awtsmoos.com measures distant keilim once before painting light today.
 */

import { collectSceneMeshes } from './tiny-render-collection.js';
import {
	appendVisibleKeilim,
	createOhrCullContext
} from './tiny-render-cull-list.js';
import { orderOpaqueMeshes } from './tiny-render-order.js';
import { sortTransparentMeshes } from './tiny-render-transparent-distance-cache.js';
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
 * Gathers and culls meshes once, preserving static batch and visibility behavior.
 *
 * @param {object} root Scene root.
 * @param {object|null} camera Active camera.
 * @param {object} options Renderer options.
 * @returns {object} Ordered opaque and translucent render lists.
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

/** Retains exactly the original fallback when no static batcher exists. */
function revealUnbatched(candidates) {
	return {
		meshes: [],
		originals: candidates.map(entry => entry.mesh),
		stats: null
	};
}

export {
	isAlphaBlend,
	isAlphaMask,
	isLitMode,
	isTransparent,
	pointSizeForMode,
	shouldCullBackfaces,
	sortTransparentMeshes,
	triangleCountForMode
};
