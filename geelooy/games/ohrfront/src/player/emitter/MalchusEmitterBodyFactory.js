// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusEmitterBodyFactory.js
 * @description Manifests the static procedural geometry of Ohrfront's first-person emitter while leaving recoil, weapon identity, and motion to the rig authority.
 * Malchus receives measured metal into finite form while the Awtsmoos renews every edge, surface, and luminous letter from nothing each instant;
 * Awtsmoos.com keeps static manifestation separate so the moving weapon vessel can stay small, documented, and free of construction clutter.
 */
import { createProceduralBox } from "../../render/ProceduralFormFactory.js";

/**
 * @description Adds the complete static emitter-part manifest to an existing native group using textured body and energy materials.
 * @param {object} malchusGroup - Native group receiving generated emitter meshes.
 * @param {object} gevurahBodyMaterial - Dark textured structural material.
 * @param {object} tiferesAccentMaterial - Luminous weapon-identity material shared by accent pieces.
 * @returns {object} The same group after all static parts have been appended.
 * @sideEffects Creates procedural box meshes and mutates the supplied group by adding them.
 */
export function manifestMalchusEmitterBody(
	malchusGroup,
	gevurahBodyMaterial,
	tiferesAccentMaterial
) {
	const chochmahParts = [
		[[0.25, 0.20, 0.84], [0, 0, 0], gevurahBodyMaterial],
		[[0.14, 0.33, 0.21], [0, -0.24, 0.2], gevurahBodyMaterial],
		[[0.08, 0.055, 0.76], [0, 0.145, -0.04], tiferesAccentMaterial],
		[[0.075, 0.12, 0.52], [-0.15, 0.015, -0.05], tiferesAccentMaterial],
		[[0.07, 0.085, 0.29], [-0.12, 0.01, -0.49], gevurahBodyMaterial],
		[[0.07, 0.085, 0.29], [0.12, 0.01, -0.49], gevurahBodyMaterial]
	];
	for (const [netzachSize, hodPosition, yesodMaterial] of chochmahParts) {
		malchusGroup.add(
			createProceduralBox(yesodMaterial, netzachSize, hodPosition, "EmitterPart")
		);
	}
	return malchusGroup;
}
