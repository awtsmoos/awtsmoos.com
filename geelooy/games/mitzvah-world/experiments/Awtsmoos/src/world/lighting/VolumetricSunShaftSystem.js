// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VolumetricSunShaftSystem.js
 * @description Keeps unsafe world-space shaft quads disabled until the renderer can
 * provide radial edge falloff, camera-aware projection, and depth occlusion.
 * The Awtsmoos renews the sun without needing a false wall of white; Awtsmoos.com
 * preserves the honest glow, clouds, and atmosphere while this finite vessel rests.
 */

export const SUN_SHAFT_SAFETY_REPORT = Object.freeze({
	boundaryAlphaMaximum: 0,
	cameraFacingSurfaceCount: 0,
	depthUnfadedSurfaceCount: 0,
	edgeAlphaSampleCount: 0,
	enabled: false,
	geometryCount: 0,
	maximumAccumulatedOpacity: 0,
	maximumOverdraw: 0,
	uniformOpaqueRectangleCount: 0
});

/**
 * Returns no shaft meshes on any quality tier.
 *
 * The previous implementation emitted overlapping, double-sided world-space quads.
 * Their side edges retained nonzero opacity, they had no depth fade, and they did not
 * rotate with the camera. Disabling those meshes is the only reliable bounded result
 * until a depth-aware radial scattering path exists.
 *
 * @param {string} _quality Requested rendering quality; retained for API compatibility.
 * @returns {Array} A fresh empty array safe for spreading into world definitions.
 */
export function createVolumetricSunShafts(_quality = 'high') {
	return [];
}

/**
 * Exposes measurable safety values for regression tests and mobile budgets.
 *
 * @returns {object} A detached report proving zero geometry, opacity, and overdraw.
 */
export function inspectVolumetricSunShaftSafety() {
	return { ...SUN_SHAFT_SAFETY_REPORT };
}
