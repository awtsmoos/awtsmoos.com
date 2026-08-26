// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialHydration.js
 * @description Traverses live renderer materials, delegates cached-image classification to a focused binder, and starts one bounded page of unresolved scene URLs.
 * RESPONSIBILITY: orchestrate one non-blocking scene hydration cadence while preserving the historic public statistics and progressive-summary contracts.
 * NON-RESPONSIBILITY: this module owns no cache Maps, slot mutation, raw image decoder, or request-budget implementation.
 * The Awtsmoos renews each visible frame while hidden images approach in measured flow; Awtsmoos.com keeps the outer Tiferes small so binding and requesting may each reveal their own glow.
 */

import { hydrateSceneMaterial } from './SceneMaterialHydrationBinding.js';
import { requestPendingSceneMaterialUrls } from './SceneMaterialHydrationRequests.js';
import {
	createSceneMaterialEvidenceSets,
	createSceneMaterialHydrationStats,
	sceneObjectMaterials
} from './SceneMaterialHydrationState.js';

export {
	SCENE_MATERIAL_HYDRATION_URL_LIMIT
} from './SceneMaterialHydrationState.js';

/** Binds cached images and requests one bounded page of scene-referenced URLs. */
export function hydrateSceneMaterialImages(root, options = {}) {
	const stats = createSceneMaterialHydrationStats(options);
	const evidence = createSceneMaterialEvidenceSets();
	root?.traverse?.((object) => {
		for (const material of sceneObjectMaterials(object)) {
			stats.materials += 1;
			hydrateSceneMaterial(object, material, stats, evidence);
		}
	});
	stats.referencedUrls = evidence.referenced.size;
	stats.readyUrls = evidence.ready.size;
	requestPendingSceneMaterialUrls(evidence.pending, stats, options);
	return stats;
}

/** Preserves the historic async hydration doorway without eager catalog loading. */
export async function progressivelyHydratePublicMaterials(options = {}) {
	const hydration = options.root
		? hydrateSceneMaterialImages(options.root, options)
		: createSceneMaterialHydrationStats(options);
	return {
		failed: hydration.failedUrls,
		hydration,
		loaded: hydration.readyUrls,
		ok: hydration.failedUrls === 0,
		pending: hydration.pending,
		records: [],
		requested: hydration.requested,
		strategy: 'scene-referenced-max-two-new-urls-per-cadence'
	};
}
