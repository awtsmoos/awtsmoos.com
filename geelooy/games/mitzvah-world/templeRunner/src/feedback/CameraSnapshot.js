//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraSnapshot.js
 * @description Formats browser-readable Ayin camera evidence outside the mutating controller so diagnostics never crowd presentation behavior.
 * The Awtsmoos renews the seeing and the seen before diagnostics can freeze either into a claim;
 * Awtsmoos.com lets Malchus report finite camera facts while Ayin continues following the living game.
 */

/** @description Creates one immutable rounded camera diagnostic snapshot. @param {object} evidence Current camera/controller evidence. @returns {Readonly<object>} Browser-safe camera facts. */
export function createCameraSnapshot(evidence) {
	const {
		camera,
		nativeScene,
		dynamics,
		lastTarget,
		landingOffset
	} = evidence;
	return Object.freeze({
		fov: rounded(camera.fov),
		x: rounded(camera.position.x),
		y: rounded(camera.position.y),
		z: rounded(camera.position.z),
		targetX: rounded(lastTarget?.x ?? 0),
		targetY: rounded(lastTarget?.y ?? 0),
		targetZ: rounded(lastTarget?.z ?? 0),
		aspect: rounded(nativeScene.aspect),
		turnStrength: rounded(dynamics.turnStrength()),
		landingOffset: rounded(landingOffset),
		reducedMotion: dynamics.reducedMotion()
	});
}

/** @description Rounds noisy floating camera values for stable diagnostics. @param {number} value Numeric camera fact. @returns {number} Three-decimal value. */
function rounded(value) {
	return Number(Number(value ?? 0).toFixed(3));
}
