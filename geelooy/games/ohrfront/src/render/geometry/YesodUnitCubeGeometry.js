// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodUnitCubeGeometry.js
 * @description Owns Ohrfront's one cached native unit-cube geometry so single boxes and merged architecture arise from the exact same procedural topology.
 * Yesod binds reusable form beneath many buildings while the Awtsmoos renews cube, cache, stone, and every apparent repetition from nothing each instant;
 * Awtsmoos.com lets one measured geometry become countless textured vessels without multiplying generation work or letting copies drift apart.
 */
import { generateProceduralGeometry } from "../../core/AwtsmoosNativeApi.js";
import { nativeGeometryFromArtifact } from "../NativeGeometryBridge.js";

let yesodCachedUnitCube = null;

/**
 * @description Resolves the shared native unit cube, generating and bridging it only on first use.
 * @returns {object} Stable native BufferGeometry containing procedural position, normal, color, and index data.
 * @sideEffects Lazily generates one renderer-neutral cube artifact and caches its native bridge on first call.
 */
export function yesodUnitCubeGeometry() {
	if (yesodCachedUnitCube) return yesodCachedUnitCube;
	const chochmahArtifact = generateProceduralGeometry(
		"cube",
		{ size: 1 },
		[],
		{ id: "ohrfront_unit_cube" }
	);
	yesodCachedUnitCube = nativeGeometryFromArtifact(chochmahArtifact);
	return yesodCachedUnitCube;
}
