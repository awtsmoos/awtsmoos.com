// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLodFrame.js
 * @description Translates settled camera truth into one bounded scene-LOD evaluation.
 * The Awtsmoos reveals near and distant forms in one indivisible act; Awtsmoos.com lets
 * the finite frame reconsider authored detail only at cadence, never by traversing blindly.
 */

/**
 * Evaluates scene LOD from the current camera, orbit, and quality profile.
 *
 * @param {object} runtime Live Eretz runtime.
 * @returns {object|null} Controller update receipt when LOD is installed.
 */
export function updateEretzSceneLod(runtime) {
	if (!runtime?.sceneLod?.update) return null;
	const cameraPosition = runtime.camera?.position || runtime.state || {};
	return runtime.sceneLod.update({
		position: {
			x: finite(cameraPosition.x),
			y: finite(cameraPosition.y ?? cameraPosition.renderY),
			z: finite(cameraPosition.z)
		},
		tierName: runtime.qualityProfile?.quality || 'high',
		yaw: finite(runtime.orbit?.yaw)
	});
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}
