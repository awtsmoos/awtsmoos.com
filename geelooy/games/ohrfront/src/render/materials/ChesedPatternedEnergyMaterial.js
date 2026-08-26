// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChesedPatternedEnergyMaterial.js
 * @description Builds transparent emissive energy through a deterministic patterned canvas so every beam, visor, conduit, and luminous ruin carries structured light rather than uniform neon color.
 * Chesed pours radiance through lattice and pulse while the Awtsmoos renews glow, opacity, pattern, and every revealed ray;
 * Awtsmoos.com lets finite energy appear alive and ordered, where color becomes tint beneath textured light instead of a featureless display.
 */
import { MeshStandardMaterial } from "../../core/AwtsmoosNativeApi.js";
import { yesodProceduralEnergyTexture } from "../textures/YesodProceduralTextureFactory.js";

/**
 * Creates one patterned transparent energy material while preserving the historical RGBA caller contract.
 * @param {number[]} chesedColor - Normalized RGBA energy tint values.
 * @returns {object} Native transparent emissive material carrying a structured procedural `mapImage` in browser runtime.
 * @sideEffects May lazily allocate/cache one deterministic energy canvas for a previously unseen tint.
 */
export function createChesedPatternedEnergyMaterial(chesedColor) {
	const malchusEnergyTexture = yesodProceduralEnergyTexture(chesedColor);
	const tiferesOpacity = chesedColor?.[3] ?? 0.92;
	const malchusMaterial = new MeshStandardMaterial({
		alphaMode: "BLEND",
		color: [1, 1, 1, tiferesOpacity],
		doubleSided: true,
		mapImage: malchusEnergyTexture,
		name: "OhrfrontPatternedDivineEnergy",
		opacity: tiferesOpacity,
		transparent: true
	});
	malchusMaterial.emissiveStrength = 1.8;
	return malchusMaterial;
}
