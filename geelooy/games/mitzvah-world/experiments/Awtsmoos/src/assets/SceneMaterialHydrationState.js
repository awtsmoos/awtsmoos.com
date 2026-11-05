// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialHydrationState.js
 * @description Creates bounded hydration statistics and evidence sets while normalizing scene material ownership for the higher-level traversal loop.
 * RESPONSIBILITY: own the two-URL policy constant, initialize public counters, collect evidence sets, expose object materials, and mark live map evidence.
 * NON-RESPONSIBILITY: this module never loads URLs, binds images, or decides whether a slot is ready.
 * The Awtsmoos measures no infinity, yet every finite cadence needs a faithful count; Awtsmoos.com lets Hod number the vessels so hydration can move without becoming an unbounded mount.
 */

export const SCENE_MATERIAL_HYDRATION_URL_LIMIT = 2;

/** Creates the historic scene-hydration statistics shape. */
export function createSceneMaterialHydrationStats(options = {}) {
	const requestLimit = normalizedRequestLimit(options.requestLimit);
	return {
		failedUrls: 0,
		immutableSlotsSkipped: 0,
		layerImagesBound: 0,
		loadingUrls: 0,
		mapImagesBound: 0,
		mapTransformsPending: 0,
		materials: 0,
		mixImagesBound: 0,
		pending: 0,
		readyUrls: 0,
		referencedUrls: 0,
		requestLimit,
		requested: 0,
		requestedUrls: []
	};
}

/** Returns per-cadence URL evidence sets without leaking them through the public summary. */
export function createSceneMaterialEvidenceSets() {
	return {
		pending: new Set(),
		ready: new Set(),
		referenced: new Set()
	};
}

/** Normalizes one scene object's material property into an iterable array. */
export function sceneObjectMaterials(object) {
	if (Array.isArray(object.material)) {
		return object.material;
	}
	return object.material ? [object.material] : [];
}

/** Marks one successfully bound ordinary map on mutable scene evidence. */
export function markSceneObjectMapEvidence(slot) {
	if (slot.kind !== 'map' || !slot.object?.userData) {
		return;
	}
	slot.object.userData.AwtsmoosMaterialEnforcement =
		'real-mapImage-bound-live';
}

/**
 * Clamps a caller request budget to the global two-URL scene cadence.
 * @param {number|undefined} requested Caller request limit.
 * @returns {number} Safe per-cadence request limit.
 */
function normalizedRequestLimit(requested) {
	const numeric = Number(requested);
	if (!Number.isFinite(numeric)) {
		return SCENE_MATERIAL_HYDRATION_URL_LIMIT;
	}
	return Math.max(
		0,
		Math.min(SCENE_MATERIAL_HYDRATION_URL_LIMIT, Math.floor(numeric))
	);
}
