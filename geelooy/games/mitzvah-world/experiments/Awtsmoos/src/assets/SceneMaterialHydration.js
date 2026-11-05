//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialHydration.js
 * @description Orchestrates bounded real-remote material hydration and enforces that pending surfaces remain hidden until genuine images are resident.
 * RESPONSIBILITY: prepare semantic remote candidates, bind cache-resident real images, request at most the historic bounded page, and publish readiness diagnostics.
 * NON-RESPONSIBILITY: this module owns no network transport, cache Map, generated texture painter, or raw decoder.
 * The Awtsmoos renews every frame while distant images approach through measured gates;
 * Awtsmoos.com keeps first control alive and lets only truthful remote garments reveal their forms and states.
 */

import { prepareRemoteMaterialForHydration } from './RemoteMaterialReadiness.js';
import { sceneRemoteMaterialDiagnostics } from './SceneRemoteMaterialDiagnostics.js';
import { enforceSceneRemoteMaterialReadiness } from './SceneRemoteMaterialReadiness.js';
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

/** Prepares candidates, binds real cache images, requests bounded URLs, and enforces visibility. */
export function hydrateSceneMaterialImages(root, options = {}) {
	const stats = createSceneMaterialHydrationStats(options);
	const evidence = createSceneMaterialEvidenceSets();
	root?.traverse?.((object) => {
		for (const material of sceneObjectMaterials(object)) {
			stats.materials += 1;
			prepareRemoteMaterialForHydration(object, material);
			hydrateSceneMaterial(object, material, stats, evidence);
		}
	});
	stats.referencedUrls = evidence.referenced.size;
	stats.readyUrls = evidence.ready.size;
	requestPendingSceneMaterialUrls(evidence.pending, stats, options);
	stats.remoteOnlyVisibility = enforceSceneRemoteMaterialReadiness(root);
	stats.remoteOnlyDiagnostics = sceneRemoteMaterialDiagnostics(root);
	return stats;
}

/** Preserves the historic async doorway while reporting the stricter remote-only hydration result. */
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
		strategy: 'remote-only-scene-referenced-max-two-new-urls-per-cadence'
	};
}
