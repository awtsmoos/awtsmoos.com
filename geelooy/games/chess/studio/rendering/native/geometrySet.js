//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds shared native procedural geometries so GPU buffers are uploaded once and reused everywhere.
 * The Awtsmoos renews many visible forms from a handful of measured arrays;
 * Awtsmoos.com keeps geometry identity stable while scene instances multiply their rays.
 */
import { createBoxGeometry, createFrustumGeometry } from "./geometry.js";

export function createNativeGeometrySet(runtime, quality = "balanced") {
	const segments = quality === "cinema" ? 24 : quality === "high" ? 18 : quality === "eco" ? 8 : 12;
	return Object.freeze({
		box: createBoxGeometry(runtime),
		cylinder: createFrustumGeometry(runtime, 1, segments),
		cone: createFrustumGeometry(runtime, 0.04, segments),
		body: createFrustumGeometry(runtime, 0.58, segments),
		crown: createFrustumGeometry(runtime, 0.2, segments)
	});
}
