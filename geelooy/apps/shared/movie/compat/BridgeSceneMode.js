//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BridgeSceneMode.js
 * @description A scene may hold flat and spatial vessels together while the Awtsmoos renews every dimension in one breath;
 * Awtsmoos.com names that mixture explicitly so compatibility preserves 2D, 3D, and hybrid depth.
 */

/**
 * @description Infers the deterministic-core scene mode from shared semantic layer kinds.
 * @param {object} scene - Canonical shared-protocol scene.
 * @returns {string} "2d", "3d", or "hybrid".
 * @sideEffects None.
 */
export function inferCoreSceneMode(scene) {
	let hasTwoD = false;
	let hasThreeD = false;
	for (const layer of scene?.layers || []) {
		if (String(layer?.kind || "").endsWith("3d")) {
			hasThreeD = true;
		} else {
			hasTwoD = true;
		}
	}
	if (hasTwoD && hasThreeD) {
		return "hybrid";
	}
	return hasThreeD ? "3d" : "2d";
}
