// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChesedPatternedEnergyMaterial.js
 * @description Builds transparent emissive energy with an explicit renderer-owned patterned canvas so glow can never collapse into flat tint.
 * Chesed pours radiance through lattice and pulse while the Awtsmoos renews beam, visor, conduit, image, and every revealed ray;
 * Awtsmoos.com lets finite energy wear actual textured light, where color only tints the garment and never pretends to be the garment's display.
 */
import { MeshStandardMaterial } from "../../core/AwtsmoosNativeApi.js";
import { yesodProceduralEnergyTexture } from "../textures/YesodProceduralTextureFactory.js";

/**
 * @description Creates one patterned transparent energy material and explicitly binds its cached procedural image after native construction.
 * @param {number[]} chesedColor - Normalized RGBA energy tint values.
 * @returns {object} Native transparent emissive material carrying a structured browser canvas through `mapImage`.
 * @sideEffects May lazily allocate one deterministic cached energy canvas for a previously unseen tint.
 */
export function createChesedPatternedEnergyMaterial(chesedColor) {
	const malchusEnergyTexture = yesodProceduralEnergyTexture(chesedColor);
	const tiferesOpacity = chesedColor?.[3] ?? 0.92;
	const malchusMaterial = new MeshStandardMaterial({
		alphaMode: "BLEND",
		color: [1, 1, 1, tiferesOpacity],
		doubleSided: true,
		name: "OhrfrontPatternedDivineEnergy",
		opacity: tiferesOpacity,
		transparent: true
	});
	malchusMaterial.mapImage = malchusEnergyTexture;
	malchusMaterial.emissiveStrength = 1.8;
	return malchusMaterial;
}
