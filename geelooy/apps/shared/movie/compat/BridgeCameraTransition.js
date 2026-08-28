//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BridgeCameraTransition.js
 * @description Cameras and transitions cross two schemas while the Awtsmoos preserves viewpoint, cut, and flow;
 * Awtsmoos.com keeps these directional laws in one vessel so every studio knows exactly where its meanings go.
 */

/**
 * @description Converts deterministic-core camera settings into shared-protocol camera settings.
 * @param {object} camera - Deterministic-core camera record.
 * @returns {object} Shared-protocol camera record.
 * @sideEffects None.
 */
export function coreCameraToShared(camera = {}) {
	const shotMap = {
		close: "closeup",
		pan: "wide",
		tilt: "medium",
		tracking: "dolly"
	};
	return {
		...structuredClone(camera),
		kind: shotMap[camera.shot] || camera.shot || camera.kind || "wide"
	};
}

/**
 * @description Converts deterministic-core transition settings into shared-protocol transition settings.
 * @param {object} transition - Deterministic-core transition record.
 * @returns {object} Shared-protocol transition record.
 * @sideEffects None.
 */
export function coreTransitionToShared(transition = {}) {
	const kindMap = {
		fade: "crossfade",
		slide: "push",
		"depth-push": "push"
	};
	return {
		...structuredClone(transition),
		kind: kindMap[transition.type] || transition.type || transition.kind || "cut"
	};
}

/**
 * @description Converts shared-protocol camera settings into deterministic-core camera settings.
 * @param {object} camera - Shared-protocol camera record.
 * @returns {object} Deterministic-core camera record.
 * @sideEffects None.
 */
export function sharedCameraToCore(camera = {}) {
	const shotMap = {
		closeup: "close",
		"extreme-closeup": "close",
		"high-angle": "wide",
		"low-angle": "medium"
	};
	return {
		...structuredClone(camera),
		shot: shotMap[camera.kind] || camera.kind || camera.shot || "wide"
	};
}

/**
 * @description Converts shared-protocol transition settings into deterministic-core transition settings.
 * @param {object} transition - Shared-protocol transition record.
 * @returns {object} Deterministic-core transition record.
 * @sideEffects None.
 */
export function sharedTransitionToCore(transition = {}) {
	const typeMap = {
		push: "slide",
		zoom: "depth-push",
		flash: "fade"
	};
	return {
		...structuredClone(transition),
		type: typeMap[transition.kind] || transition.kind || transition.type || "cut"
	};
}
